/** Public preview always reads this user's vocabulary deck. */
export const PREVIEW_DECK_USER_ID = 1;

/** Must be true for /preview routes to respond. Env alone is not enough. */
export const PREVIEW_ROUTES_LIVE = true;

const DISABLED = new Set(["0", "false", "off", "disabled", "no"]);

function previewEnvEnabled(): boolean {
  const raw = process.env.PREVIEW_USER_ID?.trim();
  if (!raw) return false;
  return !DISABLED.has(raw.toLowerCase());
}

/**
 * Preview is on when PREVIEW_ROUTES_LIVE and PREVIEW_USER_ID are both set.
 * The deck owner is always user #1 — the env value is an enable flag only.
 */
export function isPreviewEnabled(): boolean {
  return PREVIEW_ROUTES_LIVE && previewEnvEnabled();
}

export function getPreviewUserId(): number | null {
  return isPreviewEnabled() ? PREVIEW_DECK_USER_ID : null;
}
