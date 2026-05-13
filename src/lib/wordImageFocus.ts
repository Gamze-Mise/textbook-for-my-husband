/** Default when DB stores null — matches CSS `object-position: 50% 50%`. */
export const DEFAULT_IMAGE_FOCUS = 50;

export function clampImageFocus(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_IMAGE_FOCUS;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** CSS `object-position` for `object-cover` framing. */
export function objectPositionFromFocus(
  x: number | null | undefined,
  y: number | null | undefined,
): string {
  const xp = x == null ? DEFAULT_IMAGE_FOCUS : clampImageFocus(x);
  const yp = y == null ? DEFAULT_IMAGE_FOCUS : clampImageFocus(y);
  return `${xp}% ${yp}%`;
}
