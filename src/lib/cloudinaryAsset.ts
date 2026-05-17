/** Cloudinary folder for a user's word TTS audio. */
export function cloudinaryWordAudioFolder(userId: number | string): string {
  return `textbook/audi/word/${userId}`;
}

/** Cloudinary folder for a user's example-sentence TTS audio. */
export function cloudinaryExampleAudioFolder(userId: number | string): string {
  return `textbook/audi/example/${userId}`;
}

/** Cloudinary folder for a user's word card images. */
export function cloudinaryWordImageFolder(userId: number | string): string {
  return `textbook/images/word/${userId}`;
}

/** Legacy flat image folder (`textbook/word-images/u2-*`) before per-user subfolders. */
export function cloudinaryLegacyWordImageFolder(): string {
  return "textbook/word-images";
}

/**
 * Resolve image public_id for delivery. New uploads use `textbook/images/word/{id}/`;
 * legacy files remain at `textbook/word-images/u{id}-*`.
 */
export function cloudinaryWordImageDeliveryPublicId(
  stored: string | null | undefined,
  userId: number | string,
): string | null {
  const id = stored?.trim();
  if (!id) return null;
  if (id.includes("/")) return id;
  const uid = String(userId);
  if (id.startsWith(`u${uid}-`)) {
    return `${cloudinaryLegacyWordImageFolder()}/${id}`;
  }
  return `${cloudinaryWordImageFolder(userId)}/${id}`;
}

/** Strip folder prefix so only the basename is stored in the DB. */
export function cloudinaryStoragePublicId(
  fullOrBase: string,
  folder: string,
): string {
  const id = fullOrBase.trim();
  const prefix = `${folder}/`;
  if (id.startsWith(prefix)) return id.slice(prefix.length);
  const slash = id.lastIndexOf("/");
  return slash >= 0 ? id.slice(slash + 1) : id;
}

/** Rebuild full Cloudinary public_id for delivery (legacy rows may already include path). */
export function cloudinaryDeliveryPublicId(
  stored: string | null | undefined,
  folder: string,
): string | null {
  const id = stored?.trim();
  if (!id) return null;
  if (id.includes("/")) return id;
  return `${folder}/${id}`;
}

export function normalizeStoredPublicId(
  value: string | null | undefined,
  folder: string,
): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return cloudinaryStoragePublicId(trimmed, folder);
}
