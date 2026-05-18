/** Shared lifetime for verification and password-reset links (must match email copy). */
export const AUTH_LINK_EXPIRY_MS = 30 * 60 * 1000;
export const AUTH_LINK_EXPIRY_MINUTES = AUTH_LINK_EXPIRY_MS / (60 * 1000);
