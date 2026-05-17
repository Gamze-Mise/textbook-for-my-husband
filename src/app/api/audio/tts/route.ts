import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { synthesizeUsEnglishSpeech } from "@/lib/googleTts";
import {
  cloudinaryExampleAudioFolder,
  cloudinaryWordAudioFolder,
} from "@/lib/cloudinaryAsset";
import { uploadAudioBuffer } from "@/lib/uploadAudioBuffer";

const bodySchema = z
  .object({
    term: z.string().min(1).max(64).optional(),
    text: z.string().min(1).max(600).optional(),
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
  const userId = session.user.id;
  const folder = parsed.data.text?.trim()
    ? cloudinaryExampleAudioFolder(userId)
    : cloudinaryWordAudioFolder(userId);

  let buffer: Buffer;
  try {
    ({ buffer } = await synthesizeUsEnglishSpeech(raw));
  } catch {
    return NextResponse.json({ error: "TTS request failed." }, { status: 502 });
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
