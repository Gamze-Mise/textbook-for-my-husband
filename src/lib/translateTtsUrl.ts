/** Google Translate TTS URL builder (browser + server safe). */
export const TRANSLATE_TTS_LANG = "en";
export const TRANSLATE_TTS_HOST = "https://translate.google.com";

export const TRANSLATE_TTS_CLIENTS = ["tw-ob", "gtx"] as const;
export type TranslateTtsClient = (typeof TRANSLATE_TTS_CLIENTS)[number];

export function buildTranslateTtsUrl(
  text: string,
  client: TranslateTtsClient = "tw-ob",
): string {
  const q = text.trim();
  const params = new URLSearchParams({
    ie: "UTF-8",
    q,
    tl: TRANSLATE_TTS_LANG,
    total: "1",
    idx: "0",
    textlen: String(q.length),
    client,
    prev: "input",
    ttsspeed: "1",
  });
  return `${TRANSLATE_TTS_HOST}/translate_tts?${params.toString()}`;
}

export function isMp3Bytes(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return true;
  return bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
}

export function isValidMp3Buffer(buf: Buffer, minBytes = 512): boolean {
  return buf.length >= minBytes && isMp3Bytes(buf.subarray(0, 4));
}
