import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { getAccessibleClientIds } from "@/lib/permissions";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "@/components/providers";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();

  const clientIds = await getAccessibleClientIds(user.id, user.organizationId, user.role);

  const [clients, userRow, organization] = await Promise.all([
    db.client.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, name: true, slug: true, color: true },
      orderBy: { name: "asc" },
    }),
    db.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true, role: true, avatarUrl: true },
    }),
    db.organization.findUnique({
      where: { id: user.organizationId },
      select: { name: true, logoUrl: true },
    }),
  ]);

  return (
    <Providers>
      <SidebarProvider>
        <AppSidebar
          user={{
            name: userRow?.name ?? user.name,
            email: userRow?.email ?? user.email,
            role: userRow?.role ?? user.role,
            avatarUrl: userRow?.avatarUrl ?? null,
          }}
          organization={{
            name: organization?.name ?? "Social Hub",
            logoUrl: organization?.logoUrl ?? null,
          }}
          clients={clients}
        />
        <SidebarInset className="min-h-0">
          <SiteHeader />
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="@container/main flex min-h-0 flex-1 flex-col gap-2 p-4 md:gap-4 md:p-6">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Providers>
  );
}
