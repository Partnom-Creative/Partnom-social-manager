"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Zap,
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  Settings,
  Plus,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SidebarProps = {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    organizationId: string;
  };
  organization: { id: string; name: string };
  clients: Array<{ id: string; name: string; slug: string; color: string | null }>;
};

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Clients", href: "/clients", icon: Building2 },
  { label: "Posts", href: "/posts", icon: FileText },
  { label: "Team", href: "/team", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ user, organization, clients }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
          <Zap className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">
          SocialHub
        </span>
      </div>

      {/* Navigation */}
      <nav className="mt-2 space-y-0.5 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-600/90 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Clients section */}
      <div className="mt-6 flex-1 overflow-y-auto px-3">
        <div className="flex items-center justify-between px-3 pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Clients
          </span>
          {user.role === "ADMIN" && (
            <Link
              href="/clients/new"
              onClick={() => setMobileOpen(false)}
              className="rounded-md p-0.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <div className="space-y-0.5">
          {clients.map((client) => {
            const active = pathname === `/clients/${client.id}`;
            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                )}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: client.color ?? "#6366f1" }}
                />
                <span className="truncate">{client.name}</span>
              </Link>
            );
          })}

          {clients.length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-500">No clients yet</p>
          )}

          {user.role === "ADMIN" && (
            <Link
              href="/clients/new"
              onClick={() => setMobileOpen(false)}
              className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              New Client
            </Link>
          )}
        </div>
      </div>

      {/* User info */}
      <div className="border-t border-slate-700/50 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-medium text-white">
            {(user.name ?? user.email).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user.name ?? "User"}
            </p>
            <div className="flex items-center gap-1.5">
              <Badge
                variant="secondary"
                className="h-4 px-1.5 text-[10px] leading-none bg-slate-700 text-slate-300 border-0"
              >
                {user.role}
              </Badge>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-slate-900 p-2 text-white shadow-lg lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-4 rounded-md p-1 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-slate-900 lg:block">
        {sidebarContent}
      </aside>
    </>
  );
}
