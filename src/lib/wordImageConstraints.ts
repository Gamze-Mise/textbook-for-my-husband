const ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const WORD_IMAGE_ACCEPT_ATTR = ACCEPT_TYPES.join(",");

const MAX_BYTES = 2 * 1024 * 1024;

/** Client-side checks before preview or upload. */
export function validateWordImageFile(file: File): string | null {
  const mimeOk = (ACCEPT_TYPES as readonly string[]).includes(file.type);
  const extOk =
    file.type === "" || file.type === "application/octet-stream"
      ? /\.(jpe?g|png|webp)$/i.test(file.name)
      : false;
  if (!mimeOk && !extOk) {
    return "Use a JPEG, PNG, or WebP image.";
  }
  if (file.size > MAX_BYTES) {
    return "Image must be 2 MB or smaller.";
  }
  return null;
}
