/**
 * Prisma `UserRole` is stored as ADMIN | EDITOR | MEMBER | CLIENT.
 * UI names: Admin (full org), Manager (client leads), Editor (posting only).
 */
export function formatRoleLabel(role: string): string {
  const r = role.toUpperCase();
  if (r === "ADMIN") return "Admin";
  if (r === "EDITOR") return "Manager";
  if (r === "MEMBER") return "Editor";
  if (r === "CLIENT") return "Client";
  if (!role) return "";
  return role.charAt(0) + role.slice(1).toLowerCase();
}

/** Short descriptions for tooltips / drawer copy (sentence case). */
export const ORG_ROLE_DESCRIPTIONS: Record<string, string> = {
  ADMIN:
    "Full control of the organization: all clients, team roles, invites, and settings.",
  EDITOR:
    "Leads assigned clients only. Can manage posts and access for those clients. Cannot see other clients.",
  MEMBER:
    "Creates and publishes posts on assigned clients. Cannot change roles, invite people, or access clients they are not assigned to.",
};

export function formatAccessLevelLabel(level: string): string {
  const u = level.toUpperCase();
  if (u === "VIEW") return "View";
  if (u === "CREATE") return "Create";
  if (u === "MANAGE") return "Manage";
  if (u === "NONE") return "No access";
  if (!level) return "";
  return level.charAt(0) + level.slice(1).toLowerCase();
}
