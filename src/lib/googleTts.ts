import {
  TRANSLATE_TTS_CLIENTS,
  TRANSLATE_TTS_HOST,
  buildTranslateTtsUrl,
  isValidMp3Buffer,
} from "@/lib/translateTtsUrl";

const TRANSLATE_FETCH_HEADERS = {
  Referer: `${TRANSLATE_TTS_HOST}/`,
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "audio/mpeg,*/*;q=0.9",
  "Accept-Language": "en-US,en;q=0.9",
} as const;

export type TtsEngine = "translate" | "cloud";

export type SynthesizeResult = {
  buffer: Buffer;
  engine: TtsEngine;
  usedCloudFallback: boolean;
};

type TtsMode = "translate-first" | "cloud-first";

function getTtsMode(): TtsMode {
  const raw = process.env.GOOGLE_CLOUD_TTS_MODE?.trim().toLowerCase();
  if (raw === "cloud-first" || raw === "primary") return "cloud-first";
  return "translate-first";
}

function getCloudKey(): string | undefined {
  return process.env.GOOGLE_CLOUD_TTS_API_KEY?.trim() || undefined;
}

function isVercelProduction(): boolean {
  return process.env.VERCEL === "1";
}

/** Vercel Translate IP ≠ your home IP (e.g. "multi" → "multay"). Use Cloud TTS on Vercel. */
function mustUseCloudOnServer(): boolean {
  return isVercelProduction() && Boolean(getCloudKey());
}

function cloudFallbackEnabled(): boolean {
  const raw = process.env.GOOGLE_CLOUD_TTS_FALLBACK?.trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "no") return false;
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  return Boolean(getCloudKey());
}

function getCloudVoice(): { languageCode: "en-US"; name: string } {
  const name =
    process.env.GOOGLE_CLOUD_TTS_VOICE?.trim() || "en-US-Wavenet-D";
  return { languageCode: "en-US", name };
}

async function fetchTranslateTtsUrl(url: string): Promise<Buffer> {
  const res = await fetch(url, { headers: TRANSLATE_FETCH_HEADERS });
  if (!res.ok) {
    throw new Error(`Translate TTS failed (${res.status}).`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (!isValidMp3Buffer(buf)) {
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

export async function synthesizeUsEnglishSpeech(text: string): Promise<SynthesizeResult> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Text is empty.");

  const cloudKey = getCloudKey();
  const mode = getTtsMode();
  const allowCloudFallback = cloudFallbackEnabled();
  const vercelCloudOnly = mustUseCloudOnServer();

  if (isVercelProduction() && !cloudKey) {
    throw new Error(
      "GOOGLE_CLOUD_TTS_API_KEY is required on Vercel. Google Translate from the server sounds wrong (e.g. “multay” for “multi”).",
    );
  }

  if ((vercelCloudOnly || mode === "cloud-first") && cloudKey) {
    try {
      return {
        buffer: await synthesizeViaCloudTts(trimmed, cloudKey),
        engine: "cloud",
        usedCloudFallback: false,
      };
    } catch (e) {
      if (vercelCloudOnly) throw e;
      return {
        buffer: await synthesizeViaTranslateTts(trimmed),
        engine: "translate",
        usedCloudFallback: true,
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
