import { buildTranslateTtsUrl } from "@/lib/translateTtsUrl";

/** Google Translate TTS limit per request. */
const LIVE_TERM_MAX = 200;

/**
 * URL for <audio> playback. Uses Google Translate in the browser (correct local-style
 * pronunciation) instead of server-generated Cloudinary files from Vercel.
 */
export function wordPlaybackAudioSrc(
  term: string,
  storedCloudinarySrc: string | null,
): string | null {
  const t = term.trim();
  if (!t) return storedCloudinarySrc;
  if (t.length > LIVE_TERM_MAX) return storedCloudinarySrc;
  return buildTranslateTtsUrl(t);
}
