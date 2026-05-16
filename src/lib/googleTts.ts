import googleTTS from "google-tts-api";

/** Google Translate TTS — `tl=en` on translate.google.com (not `en_us`). */
const TRANSLATE_TTS_LANG = "en";
const TRANSLATE_TTS_HOST = "https://translate.google.com";

const TRANSLATE_FETCH_HEADERS = {
  Referer: `${TRANSLATE_TTS_HOST}/`,
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
} as const;

export type TtsEngine = "translate" | "cloud";

export type SynthesizeResult = {
  buffer: Buffer;
  engine: TtsEngine;
};

type TtsMode = "translate-first" | "cloud-first";

function getTtsMode(): TtsMode {
  const raw = process.env.GOOGLE_CLOUD_TTS_MODE?.trim().toLowerCase();
  if (raw === "cloud-first" || raw === "primary") return "cloud-first";
  return "translate-first";
}

function getCloudVoice(): { languageCode: "en-US"; name: string } {
  const name =
    process.env.GOOGLE_CLOUD_TTS_VOICE?.trim() || "en-US-Neural2-D";
  return { languageCode: "en-US", name };
}

async function synthesizeViaTranslateTts(text: string): Promise<Buffer> {
  const url = googleTTS.getAudioUrl(text, {
    lang: TRANSLATE_TTS_LANG,
    slow: false,
    host: TRANSLATE_TTS_HOST,
  });

  const res = await fetch(url, { headers: TRANSLATE_FETCH_HEADERS });
  if (!res.ok) {
    throw new Error(`Translate TTS failed (${res.status}).`);
  }
  return Buffer.from(await res.arrayBuffer());
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

  if (mode === "cloud-first" && cloudKey) {
    try {
      return {
        buffer: await synthesizeViaCloudTts(trimmed, cloudKey),
        engine: "cloud",
      };
    } catch {
      return {
        buffer: await synthesizeViaTranslateTts(trimmed),
        engine: "translate",
      };
    }
  }

  try {
    return {
      buffer: await synthesizeViaTranslateTts(trimmed),
      engine: "translate",
    };
  } catch {
    if (!cloudKey) throw new Error("TTS failed.");
    return {
      buffer: await synthesizeViaCloudTts(trimmed, cloudKey),
      engine: "cloud",
    };
  }
}
