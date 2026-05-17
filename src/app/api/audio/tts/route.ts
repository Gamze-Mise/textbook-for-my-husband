import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { synthesizeUsEnglishSpeech, type TtsEngine } from "@/lib/googleTts";
import { isValidMp3Buffer } from "@/lib/translateTtsUrl";
import { uploadAudioBuffer } from "@/lib/uploadAudioBuffer";

const MAX_CLIENT_AUDIO_BYTES = 512 * 1024;

const bodySchema = z
  .object({
    term: z.string().min(1).max(64).optional(),
    text: z.string().min(1).max(600).optional(),
    audioBase64: z.string().min(64).max(700_000).optional(),
  })
  .refine((v) => Boolean(v.term?.trim() || v.text?.trim()), {
    message: "Either term or text is required.",
  });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const raw = (parsed.data.text ?? parsed.data.term ?? "").trim();
  const folder = parsed.data.text?.trim()
    ? "textbook/audio/example"
    : "textbook/audio/word";

  let buffer: Buffer;
  let engine: TtsEngine = "translate";
  let usedCloudFallback = false;
  let source: "client" | "server" = "server";

  const clientB64 = parsed.data.audioBase64?.trim();
  if (clientB64) {
    try {
      const clientBuf = Buffer.from(clientB64, "base64");
      if (
        clientBuf.length <= MAX_CLIENT_AUDIO_BYTES &&
        isValidMp3Buffer(clientBuf)
      ) {
        buffer = clientBuf;
        engine = "translate";
        source = "client";
      } else {
        return NextResponse.json(
          { error: "Invalid client audio." },
          { status: 400 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid client audio." },
        { status: 400 },
      );
    }
  } else {
    try {
      ({ buffer, engine, usedCloudFallback } = await synthesizeUsEnglishSpeech(
        raw,
        { isWord: Boolean(parsed.data.term?.trim()) },
      ));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "TTS request failed.";
      const needsKey = msg.includes("GOOGLE_CLOUD_TTS_API_KEY");
      return NextResponse.json(
        { error: needsKey ? msg : "TTS request failed." },
        { status: needsKey ? 503 : 502 },
      );
    }
  }

  const safe = raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
  const publicId = `${safe}-${Date.now()}`;

  try {
    const uploaded = await uploadAudioBuffer({
      buffer,
      folder,
      publicId,
    });

    return NextResponse.json({
      ok: true,
      audioPublicId: uploaded.audioPublicId,
      audioSrc: uploaded.audioSrc,
      engine,
      source,
      usedCloudFallback,
    });
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : typeof e === "object" && e && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Cloudinary upload failed.";
    return NextResponse.json(
      {
        error:
          msg.includes("cloud_name") || msg.includes("Invalid cloud_name")
            ? "Cloudinary credentials are invalid. Check CLOUDINARY_* env vars."
            : "Cloudinary upload failed.",
      },
      { status: 502 },
    );
  }
}
