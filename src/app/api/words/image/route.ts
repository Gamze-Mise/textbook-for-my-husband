import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  cloudinaryDeliveryPublicId,
  cloudinaryStoragePublicId,
  cloudinaryWordImageFolder,
} from "@/lib/cloudinaryAsset";
import { cloudinary } from "@/lib/cloudinary";
import { cloudinaryImageDeliveryUrl } from "@/lib/cloudinaryDelivery";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const folder = cloudinaryWordImageFolder(userId);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field." }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, or WebP images are allowed." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be 2 MB or smaller." },
      { status: 400 },
    );
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Could not read file." }, { status: 400 });
  }

  const safeBase = `img-${Date.now()}`;

  try {
    const uploaded = await new Promise<{ public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder,
          public_id: safeBase,
          overwrite: true,
        },
        (error, result) => {
          if (error || !result?.public_id) return reject(error);
          resolve({ public_id: result.public_id });
        },
      );
      stream.end(buffer);
    });

    const imagePublicId = cloudinaryStoragePublicId(
      uploaded.public_id,
      folder,
    );
    const imageSrc = cloudinaryImageDeliveryUrl(
      cloudinaryDeliveryPublicId(imagePublicId, folder),
    );
    if (!imageSrc) {
      return NextResponse.json(
        { error: "Could not build image delivery URL." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true as const,
      imagePublicId,
      imageSrc,
    });
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : typeof e === "object" && e && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Upload failed.";
    return NextResponse.json(
      {
        error:
          msg.includes("cloud_name") || msg.includes("Invalid cloud_name")
            ? "Cloudinary credentials are invalid. Check CLOUDINARY_* env vars."
            : "Image upload failed.",
      },
      { status: 502 },
    );
  }
}
