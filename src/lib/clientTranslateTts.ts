import {
  TRANSLATE_TTS_CLIENTS,
  buildTranslateTtsUrl,
  isMp3Bytes,
  type TranslateTtsClient,
} from "@/lib/translateTtsUrl";

const BROWSER_FETCH_HEADERS = {
  Referer: "https://translate.google.com/",
} as const;

const CAPTURE_TIMEOUT_MS = 18_000;

async function fetchTranslateTtsViaFetch(
  trimmed: string,
): Promise<Blob | null> {
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
      // CORS — try next client or capture path
    }
  }
  return null;
}

/**
 * Google blocks fetch() from app origins (CORS) but allows <audio> playback.
 * Record that playback so we can upload the user's-network pronunciation.
 */
function captureTranslateTtsViaAudio(
  trimmed: string,
  client: TranslateTtsClient,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = buildTranslateTtsUrl(trimmed, client);
    const audio = document.createElement("audio");
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    audio.setAttribute("playsinline", "true");

    let settled = false;
    const finish = (blob: Blob | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      resolve(blob);
    };

    const timer = window.setTimeout(() => finish(null), CAPTURE_TIMEOUT_MS);

    audio.onerror = () => finish(null);

    audio.oncanplaythrough = () => {
      void (async () => {
        if (
          typeof AudioContext === "undefined" ||
          typeof MediaRecorder === "undefined"
        ) {
          finish(null);
          return;
        }

        let ctx: AudioContext | null = null;
        try {
          ctx = new AudioContext();
          const source = ctx.createMediaElementSource(audio);
          const dest = ctx.createMediaStreamDestination();
          source.connect(dest);

          const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : MediaRecorder.isTypeSupported("audio/webm")
              ? "audio/webm"
              : "";
          if (!mime) {
            finish(null);
            return;
          }

          const recorder = new MediaRecorder(dest.stream, { mimeType: mime });
          const chunks: BlobPart[] = [];
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
          };
          recorder.onerror = () => finish(null);
          recorder.onstop = () => {
            void ctx?.close();
            const blob = new Blob(chunks, { type: mime });
            finish(blob.size > 200 ? blob : null);
          };

          recorder.start(100);
          await audio.play();

          audio.onended = () => {
            if (recorder.state === "recording") recorder.stop();
          };

          // Safety stop if onended never fires
          window.setTimeout(() => {
            if (recorder.state === "recording") recorder.stop();
          }, 12_000);
        } catch {
          void ctx?.close();
          finish(null);
        }
      })();
    };

    audio.src = url;
    audio.load();
  });
}

async function captureTranslateTtsInBrowser(
  trimmed: string,
): Promise<Blob | null> {
  for (const client of TRANSLATE_TTS_CLIENTS) {
    const blob = await captureTranslateTtsViaAudio(trimmed, client);
    if (blob) return blob;
  }
  return null;
}

/** Browser-side Translate TTS (user network). Falls back to server if unavailable. */
export async function fetchTranslateTtsInBrowser(
  text: string,
): Promise<Blob | null> {
  const trimmed = text.trim();
  if (!trimmed || typeof window === "undefined") return null;

  const direct = await fetchTranslateTtsViaFetch(trimmed);
  if (direct) return direct;

  return captureTranslateTtsInBrowser(trimmed);
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
