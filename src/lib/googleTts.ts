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

export type SynthesizeResult = {
  buffer: Buffer;
};

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

export async function synthesizeUsEnglishSpeech(
  text: string,
): Promise<SynthesizeResult> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Text is empty.");
  return { buffer: await synthesizeViaTranslateTts(trimmed) };
}
