import {
  TRANSLATE_TTS_CLIENTS,
  buildTranslateTtsUrl,
  isMp3Bytes,
} from "@/lib/translateTtsUrl";

const BROWSER_FETCH_HEADERS = {
  Referer: "https://translate.google.com/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "audio/mpeg,*/*;q=0.9",
  "Accept-Language": "en-US,en;q=0.9",
} as const;

function isLocalDevHost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h.endsWith(".local");
}

/**
 * Browser Translate TTS only works on localhost (Google blocks other origins with 404).
 * On production, skip this and use server Cloud TTS via /api/audio/tts.
 */
export async function fetchTranslateTtsInBrowser(
  text: string,
): Promise<Blob | null> {
  const trimmed = text.trim();
  if (!trimmed || typeof window === "undefined" || !isLocalDevHost()) {
    return null;
  }

  for (const client of TRANSLATE_TTS_CLIENTS) {
    const url = buildTranslateTtsUrl(trimmed, client);
    try {
      const res = await fetch(url, {
        headers: BROWSER_FETCH_HEADERS,
        credentials: "omit",
        mode: "cors",
      });
      if (!res.ok) continue;
      const blob = await res.blob();
      if (blob.size < 512) continue;
      const bytes = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
      if (!isMp3Bytes(bytes)) continue;
      return blob;
    } catch {
      // CORS / 404 from Google on non-translate origins
    }
  }
  return null;
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
