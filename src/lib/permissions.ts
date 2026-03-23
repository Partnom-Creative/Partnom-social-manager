import { db } from "@/lib/db";
import { AccessLevel, UserRole } from "@/generated/prisma";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  organizationId: string;
};

export function isAdmin(user: SessionUser) {
  return user.role === UserRole.ADMIN;
}

export async function getAccessibleClientIds(userId: string, orgId: string, role: UserRole): Promise<string[]> {
  if (role === UserRole.ADMIN) {
    const clients = await db.client.findMany({
      where: { organizationId: orgId },
      select: { id: true },
    });
    return clients.map((c) => c.id);
  }

  const access = await db.teamAccess.findMany({
    where: { userId },
    select: { clientId: true },
  });
  return access.map((a) => a.clientId);
}

export async function getUserAccessLevel(
  userId: string,
  clientId: string,
  role: UserRole
): Promise<AccessLevel | null> {
  if (role === UserRole.ADMIN) return AccessLevel.MANAGE;

  const access = await db.teamAccess.findFirst({
    where: { userId, clientId },
  });
  return access?.accessLevel ?? null;
}

export async function requireAccess(
  userId: string,
  clientId: string,
  role: UserRole,
  minLevel: AccessLevel
): Promise<boolean> {
  const level = await getUserAccessLevel(userId, clientId, role);
  if (!level) return false;

  const hierarchy: AccessLevel[] = [AccessLevel.VIEW, AccessLevel.CREATE, AccessLevel.MANAGE];
  return hierarchy.indexOf(level) >= hierarchy.indexOf(minLevel);
}
