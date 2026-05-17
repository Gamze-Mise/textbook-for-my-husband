import { blobToBase64, fetchTranslateTtsInBrowser } from "@/lib/clientTranslateTts";

export type TtsEngine = "translate" | "cloud";
export type TtsSource = "client" | "server";

export type AudioTtsOk = {
  ok: true;
  audioPublicId: string;
  audioSrc: string;
  engine?: TtsEngine;
  source?: TtsSource;
  usedCloudFallback?: boolean;
};

export type AudioTtsResult = AudioTtsOk | { ok: false; error: string };

type TtsBody = { term?: string; text?: string };

/** Prefer browser Translate TTS (user IP), then server /api/audio/tts. */
export async function requestAudioTts(body: TtsBody): Promise<AudioTtsResult> {
  const raw = (body.text ?? body.term ?? "").trim();
  if (!raw) {
    return { ok: false, error: "Text is required." };
  }

  const browserBlob = await fetchTranslateTtsInBrowser(raw);
  const payload: TtsBody & { audioBase64?: string } = { ...body };

  if (browserBlob) {
    try {
      payload.audioBase64 = await blobToBase64(browserBlob);
    } catch {
      // fall through to server-only synthesis
    }
  }

  const tts = await fetch("/api/audio/tts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const ttsJson = (await tts.json().catch(() => null)) as
    | {
        ok: true;
        audioPublicId: string;
        audioSrc: string;
        engine?: TtsEngine;
        source?: TtsSource;
        usedCloudFallback?: boolean;
      }
    | { error: string }
    | null;

  if (!tts.ok || !ttsJson || "error" in ttsJson) {
    return {
      ok: false,
      error:
        ttsJson && "error" in ttsJson
          ? ttsJson.error
          : "Pronunciation could not be generated.",
    };
  }

  return {
    ok: true,
    audioPublicId: ttsJson.audioPublicId,
    audioSrc: ttsJson.audioSrc,
    engine: ttsJson.engine,
    source: ttsJson.source,
    usedCloudFallback: ttsJson.usedCloudFallback,
  };
}
