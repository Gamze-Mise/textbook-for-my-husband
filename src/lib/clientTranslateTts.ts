import {
  TRANSLATE_TTS_CLIENTS,
  buildTranslateTtsUrl,
  isMp3Bytes,
} from "@/lib/translateTtsUrl";

const BROWSER_FETCH_HEADERS = {
  Referer: "https://translate.google.com/",
} as const;

/** Fetch Translate TTS from the user's browser (home IP), not the server datacenter. */
export async function fetchTranslateTtsInBrowser(
  text: string,
): Promise<Blob | null> {
  const trimmed = text.trim();
  if (!trimmed || typeof window === "undefined") return null;

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
      // CORS or network — try next client / fall back to server TTS
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
