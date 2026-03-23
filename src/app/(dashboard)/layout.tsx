import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { getAccessibleClientIds } from "@/lib/permissions";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Providers } from "@/components/providers";
import { Separator } from "@/components/ui/separator";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();

  const clientIds = await getAccessibleClientIds(user.id, user.organizationId, user.role);

  const clients = await db.client.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, name: true, slug: true, color: true },
    orderBy: { name: "asc" },
  });

  return (
    <Providers>
      <SidebarProvider>
        <AppSidebar
          user={{ name: user.name, email: user.email, role: user.role }}
          clients={clients}
        />
        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b px-6">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
          </header>
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </Providers>
  );
}
