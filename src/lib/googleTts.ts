import googleTTS from "google-tts-api";

/** Google Translate TTS — `tl=en` on translate.google.com (not `en_us`). */
const TRANSLATE_TTS_LANG = "en";
const TRANSLATE_TTS_HOST = "https://translate.google.com";

const TRANSLATE_FETCH_HEADERS = {
  Referer: `${TRANSLATE_TTS_HOST}/`,
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "audio/mpeg,*/*;q=0.9",
  "Accept-Language": "en-US,en;q=0.9",
} as const;

/** tw-ob first; gtx as a second attempt when Translate blocks datacenter IPs. */
const TRANSLATE_TTS_CLIENTS = ["tw-ob", "gtx"] as const;

export type TtsEngine = "translate" | "cloud";

export type SynthesizeResult = {
  buffer: Buffer;
  engine: TtsEngine;
  /** True when Translate failed and Cloud TTS was used instead. */
  usedCloudFallback: boolean;
};

type TtsMode = "translate-first" | "cloud-first";

function getTtsMode(): TtsMode {
  const raw = process.env.GOOGLE_CLOUD_TTS_MODE?.trim().toLowerCase();
  if (raw === "cloud-first" || raw === "primary") return "cloud-first";
  return "translate-first";
}

function cloudFallbackEnabled(): boolean {
  const raw = process.env.GOOGLE_CLOUD_TTS_FALLBACK?.trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "no") return false;
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  // On Vercel, Translate usually works; Cloud Neural2 often mispronounces short words (e.g. "multi" → "multay").
  if (process.env.VERCEL === "1") return false;
  return true;
}

function getCloudVoice(): { languageCode: "en-US"; name: string } {
  const name =
    process.env.GOOGLE_CLOUD_TTS_VOICE?.trim() || "en-US-Neural2-D";
  return { languageCode: "en-US", name };
}

function isMp3Buffer(buf: Buffer): boolean {
  if (buf.length < 4) return false;
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) return true; // ID3
  return buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0; // MPEG sync
}

function buildTranslateTtsUrl(
  text: string,
  client: (typeof TRANSLATE_TTS_CLIENTS)[number],
): string {
  const base = googleTTS.getAudioUrl(text, {
    lang: TRANSLATE_TTS_LANG,
    slow: false,
    host: TRANSLATE_TTS_HOST,
  });
  const url = new URL(base);
  url.searchParams.set("client", client);
  return url.toString();
}

async function fetchTranslateTtsUrl(url: string): Promise<Buffer> {
  const res = await fetch(url, { headers: TRANSLATE_FETCH_HEADERS });
  if (!res.ok) {
    throw new Error(`Translate TTS failed (${res.status}).`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (!isMp3Buffer(buf) || buf.length < 512) {
    throw new Error("Translate TTS returned invalid audio.");
  }
  return buf;
}

async function synthesizeViaTranslateTts(text: string): Promise<Buffer> {
  let lastErr: unknown;
  for (const client of TRANSLATE_TTS_CLIENTS) {
    const url = buildTranslateTtsUrl(text, client);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await fetchTranslateTtsUrl(url);
      } catch (e) {
        lastErr = e;
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 400));
        }
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Translate TTS failed.");
}

async function synthesizeViaCloudTts(
  text: string,
  apiKey: string,
): Promise<Buffer> {
  const voice = getCloudVoice();
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice,
        audioConfig: { audioEncoding: "MP3", speakingRate: 1 },
      }),
    },
  );

  const json = (await res.json().catch(() => null)) as
    | { audioContent?: string; error?: { message?: string } }
    | null;

  if (!res.ok || !json?.audioContent) {
    const detail = json?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`Cloud TTS failed: ${detail}`);
  }

  return Buffer.from(json.audioContent, "base64");
}

/** Translate first; Cloud TTS when key is set and Translate fails (or mode=cloud-first). */
export async function synthesizeUsEnglishSpeech(text: string): Promise<SynthesizeResult> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Text is empty.");

  const cloudKey = process.env.GOOGLE_CLOUD_TTS_API_KEY?.trim();
  const mode = getTtsMode();
  const allowCloudFallback = cloudFallbackEnabled();

  if (mode === "cloud-first" && cloudKey) {
    try {
      return {
        buffer: await synthesizeViaCloudTts(trimmed, cloudKey),
        engine: "cloud",
        usedCloudFallback: false,
      };
    } catch {
      return {
        buffer: await synthesizeViaTranslateTts(trimmed),
        engine: "translate",
        usedCloudFallback: false,
      };
    }
  }

  try {
    return {
      buffer: await synthesizeViaTranslateTts(trimmed),
      engine: "translate",
      usedCloudFallback: false,
    };
  } catch {
    if (!cloudKey || !allowCloudFallback) throw new Error("TTS failed.");
    return {
      buffer: await synthesizeViaCloudTts(trimmed, cloudKey),
      engine: "cloud",
      usedCloudFallback: true,
    };
  }
}
