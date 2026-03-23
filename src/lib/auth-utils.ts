import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { SessionUser } from "@/lib/permissions";

export async function getSession() {
  const session = await auth();
  return session;
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return {
    id: session.user.id!,
    email: session.user.email!,
    name: session.user.name ?? null,
    role: (session.user as any).role,
    organizationId: (session.user as any).organizationId,
  };
}
