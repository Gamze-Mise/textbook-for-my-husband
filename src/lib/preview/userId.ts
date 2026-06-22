/** Public preview always reads this user's vocabulary deck. */
export const PREVIEW_DECK_USER_ID = 2;

const DISABLED = new Set(["0", "false", "off", "disabled", "no"]);

/**
 * Preview is on when PREVIEW_USER_ID is set in the environment.
 * The deck owner is always user #2 — the env value is an enable flag only.
 */
export function isPreviewEnabled(): boolean {
  const raw = process.env.PREVIEW_USER_ID?.trim();
  if (!raw) return false;
  return !DISABLED.has(raw.toLowerCase());
}

export function getPreviewUserId(): number | null {
  return isPreviewEnabled() ? PREVIEW_DECK_USER_ID : null;
}
