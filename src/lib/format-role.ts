/**
 * Prisma `UserRole` and similar enums are stored as ADMIN, EDITOR, …
 * Use this for UI labels so we never show raw ALL_CAPS.
 */
export function formatRoleLabel(role: string): string {
  const r = role.toUpperCase();
  if (r === "ADMIN") return "Admin";
  if (r === "EDITOR") return "Editor";
  if (r === "MEMBER") return "Member";
  if (r === "CLIENT") return "Client";
  if (!role) return "";
  return role.charAt(0) + role.slice(1).toLowerCase();
}
