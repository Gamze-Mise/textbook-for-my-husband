type TtsBody = { term?: string; text?: string };

export type AudioTtsOk = {
  ok: true;
  audioPublicId: string;
  audioSrc: string;
};

export type AudioTtsResult = AudioTtsOk | { ok: false; error: string };

export async function fetchAudioTts(body: TtsBody): Promise<AudioTtsResult> {
  const raw = (body.text ?? body.term ?? "").trim();
  if (!raw) {
    return { ok: false, error: "Text is required." };
  }

  const res = await fetch("/api/audio/tts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => null)) as
    | { ok: true; audioPublicId: string; audioSrc: string }
    | { error: string }
    | null;

  if (!res.ok || !json || "error" in json) {
    return {
      ok: false,
      error:
        json && "error" in json
          ? json.error
          : "Audio could not be generated.",
    };
  }

  return {
    ok: true,
    audioPublicId: json.audioPublicId,
    audioSrc: json.audioSrc,
  };
}
