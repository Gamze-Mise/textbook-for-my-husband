import { cloudinary } from "@/lib/cloudinary";

/** Build HTTPS delivery URL from stored Cloudinary `public_id` (no DB URL columns). */
export function cloudinaryVideoDeliveryUrl(
  publicId: string | null | undefined,
): string | null {
  const id = publicId?.trim();
  if (!id) return null;
  return cloudinary.url(id, { resource_type: "video", secure: true });
}

export function cloudinaryImageDeliveryUrl(
  publicId: string | null | undefined,
): string | null {
  const id = publicId?.trim();
  if (!id) return null;
  return cloudinary.url(id, { resource_type: "image", secure: true });
}
