"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LayoutDashboard, Users, Building2, PenSquare, Settings, LogOut, ChevronUp, Calendar } from "lucide-react";

type ClientItem = { id: string; name: string; slug: string; color: string | null };

export function AppSidebar({
  user,
  clients,
}: {
  user: { name: string | null; email: string; role: string };
  clients: ClientItem[];
}) {
  const pathname = usePathname();

  const mainNav = [
    { title: "Dashboard", href: "/", icon: LayoutDashboard },
    { title: "Posts", href: "/posts", icon: PenSquare },
    { title: "Calendar", href: "/calendar", icon: Calendar },
    { title: "Clients", href: "/clients", icon: Building2 },
  ];

  const adminNav = [
    { title: "Team", href: "/team", icon: Users },
    { title: "Settings", href: "/settings", icon: Settings },
  ];

  const initials = (user.name || user.email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            SH
          </div>
          <span className="font-semibold text-lg">Social Hub</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />} isActive={pathname === item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {clients.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Clients</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {clients.map((client) => (
                    <SidebarMenuItem key={client.id}>
                      <SidebarMenuButton
                        render={<Link href={`/clients/${client.slug}`} />}
                        isActive={pathname.startsWith(`/clients/${client.slug}`)}
                      >
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: client.color || "#6366f1" }}
                        />
                        <span className="truncate">{client.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {user.role === "ADMIN" && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNav.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton render={<Link href={item.href} />} isActive={pathname === item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton className="w-full" />}>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="truncate">{user.name || user.email}</span>
                <ChevronUp className="ml-auto h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
