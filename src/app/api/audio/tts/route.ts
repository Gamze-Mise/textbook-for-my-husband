import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import googleTTS from "google-tts-api";

const bodySchema = z.object({
  term: z.string().min(1).max(64),
});

function uploadToCloudinary(buffer: Buffer, publicId: string) {
  return new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "textbook/audio",
          public_id: publicId,
          overwrite: true,
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        },
      );
      stream.end(buffer);
    },
  );
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const term = parsed.data.term.trim();

  // NOTE: This uses Google Translate TTS endpoint via google-tts-api.
  const url = googleTTS.getAudioUrl(term, {
    lang: "en",
    slow: false,
    host: "https://translate.google.com",
  });

  let buffer: Buffer;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: "TTS request failed." }, { status: 502 });
    }
    const arr = await res.arrayBuffer();
    buffer = Buffer.from(arr);
  } catch {
    return NextResponse.json({ error: "TTS request failed." }, { status: 502 });
  }

  const safe = term.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
  const publicId = `${safe}-${Date.now()}`;

  try {
    const uploaded = await uploadToCloudinary(buffer, publicId);

    return NextResponse.json({
      ok: true,
      audioUrl: uploaded.secure_url,
      audioPublicId: uploaded.public_id,
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

