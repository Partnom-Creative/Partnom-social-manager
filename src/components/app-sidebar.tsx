"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Building2,
  PenSquare,
  Settings,
  LogOut,
  Calendar,
  User,
  CreditCard,
  Bell,
  MoreVertical,
} from "lucide-react";

type ClientItem = { id: string; name: string; slug: string; color: string | null };

function twoLetterInitials(text: string) {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return text.slice(0, 2).toUpperCase();
}

export function AppSidebar({
  user,
  organization,
  clients,
}: {
  user: {
    name: string | null;
    email: string;
    role: string;
    avatarUrl: string | null;
  };
  organization: { name: string; logoUrl: string | null };
  clients: ClientItem[];
}) {
  const pathname = usePathname();
  const router = useRouter();

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

  const displayName = user.name || "Account";
  const userInitials = (user.name || user.email)
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const orgInitials = twoLetterInitials(organization.name);

  return (
    <Sidebar variant="inset">
      {/* pl-4 = group p-2 (8px) + menu button p-2 (8px) so logo lines up with nav icons */}
      <SidebarHeader className="gap-2 py-4 pl-4 pr-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/" />}
              size="lg"
              className="gap-3 px-0 py-0 hover:bg-transparent hover:text-sidebar-foreground active:bg-transparent data-active:bg-transparent data-active:font-semibold"
            >
              <Avatar className="h-8 w-8 shrink-0 rounded-lg">
                {organization.logoUrl ? (
                  <AvatarImage
                    src={organization.logoUrl}
                    alt=""
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold">
                  {orgInitials}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-lg truncate">{organization.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />} isActive={pathname === item.href}>
                    <item.icon />
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
                        <item.icon />
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

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground"
                  />
                }
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  {user.avatarUrl ? (
                    <AvatarImage
                      src={user.avatarUrl}
                      alt=""
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="rounded-lg text-xs">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">{user.email}</span>
                </div>
                <MoreVertical className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--anchor-width) min-w-56 rounded-lg"
                side="top"
                align="start"
                sideOffset={4}
              >
                <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    {user.avatarUrl ? (
                      <AvatarImage
                        src={user.avatarUrl}
                        alt=""
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-medium text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <User />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <CreditCard />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Bell />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
