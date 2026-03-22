import { AccessLevel, UserRole } from "@/generated/prisma";
import { db } from "./db";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  organizationId: string;
};

export async function getAccessibleClientIds(userId: string, role: UserRole): Promise<string[] | "all"> {
  if (role === UserRole.ADMIN) return "all";

  const access = await db.teamAccess.findMany({
    where: { userId },
    select: { clientId: true },
  });

  return access.map((a) => a.clientId);
}

export async function getUserClientAccess(
  userId: string,
  clientId: string,
  role: UserRole
): Promise<AccessLevel | null> {
  if (role === UserRole.ADMIN) return AccessLevel.MANAGE;

  const access = await db.teamAccess.findUnique({
    where: { userId_clientId: { userId, clientId } },
  });

  return access?.accessLevel ?? null;
}

export function canCreate(level: AccessLevel | null): boolean {
  return level === AccessLevel.CREATE || level === AccessLevel.MANAGE;
}

export function canManage(level: AccessLevel | null): boolean {
  return level === AccessLevel.MANAGE;
}

export function canView(level: AccessLevel | null): boolean {
  return level !== null;
}
