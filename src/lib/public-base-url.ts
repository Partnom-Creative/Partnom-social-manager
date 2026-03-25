/**
 * Canonical public site URL for redirects, invite links, and OAuth callbacks.
 * Set AUTH_URL and NEXTAUTH_URL to the same value in production (https, no trailing slash).
 * On Vercel, VERCEL_URL is a fallback when explicit URLs are unset (preview deployments).
 */
export function getPublicBaseUrl(): string {
  const explicit =
    process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}
