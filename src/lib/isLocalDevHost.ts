/** True when the app runs on the developer machine (not the deployed site). */
export function isLocalDevHost(hostname?: string): boolean {
  const h =
    hostname ??
    (typeof window !== "undefined" ? window.location.hostname : "");
  return h === "localhost" || h === "127.0.0.1" || h.endsWith(".local");
}
