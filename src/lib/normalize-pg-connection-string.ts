/**
 * node-postgres (pg v8+) warns when `sslmode` is `require`, `prefer`, or `verify-ca`
 * because those are currently treated like `verify-full` but will change in pg v9.
 *
 * Set `sslmode=verify-full` explicitly to match today's behavior and silence the warning.
 * If you need libpq semantics, use `uselibpqcompat=true&sslmode=require` — we leave that untouched.
 *
 * @see https://github.com/brianc/node-postgres/issues/3436
 */
export function normalizePgConnectionString(connectionString: string): string {
  if (!connectionString.trim()) {
    return connectionString;
  }

  if (/\buselibpqcompat=true\b/i.test(connectionString)) {
    return connectionString;
  }

  try {
    const u = new URL(connectionString);
    const mode = u.searchParams.get("sslmode")?.toLowerCase();
    if (mode === "require" || mode === "prefer" || mode === "verify-ca") {
      u.searchParams.set("sslmode", "verify-full");
      return u.toString();
    }
    return connectionString;
  } catch {
    return connectionString
      .replace(/([?&])sslmode=require\b/gi, "$1sslmode=verify-full")
      .replace(/([?&])sslmode=prefer\b/gi, "$1sslmode=verify-full")
      .replace(/([?&])sslmode=verify-ca\b/gi, "$1sslmode=verify-full");
  }
}
