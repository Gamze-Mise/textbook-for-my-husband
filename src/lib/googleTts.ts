import googleTTS from "google-tts-api";

/**
 * US English on Google Translate TTS: use `tl=en` on translate.google.com.
 * `tl=en_us` is a different voice and often mispronounces words (e.g. "Hypocrisy").
 */
const TRANSLATE_TTS_LANG = "en";
const TRANSLATE_TTS_HOST = "https://translate.google.com";

const TRANSLATE_FETCH_HEADERS = {
  Referer: `${TRANSLATE_TTS_HOST}/`,
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
} as const;

/** Optional: Cloud Text-to-Speech Neural2 (closer to high-quality US English). */
const CLOUD_VOICE = {
  languageCode: "en-US",
  name: "en-US-Neural2-F",
} as const;

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
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: CLOUD_VOICE,
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

/** US English speech audio (MP3 bytes). Prefers Cloud TTS when API key is configured. */
export async function synthesizeUsEnglishSpeech(text: string): Promise<Buffer> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Text is empty.");

  const cloudKey = process.env.GOOGLE_CLOUD_TTS_API_KEY?.trim();
  if (cloudKey) {
    try {
      return await synthesizeViaCloudTts(trimmed, cloudKey);
    } catch {
      // Fall back to Translate TTS if Cloud is misconfigured or quota exceeded.
    }
  }

  return synthesizeViaTranslateTts(trimmed);
}
