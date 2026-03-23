export type UserRole = "ADMIN" | "MEMBER" | "CLIENT";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  organizationId: string;
};
