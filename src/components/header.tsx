"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ChevronRight, LogOut, User } from "lucide-react";
import Link from "next/link";

type HeaderProps = {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  clients: "Clients",
  posts: "Posts",
  team: "Team",
  settings: "Settings",
};

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return [{ label: "Dashboard", href: "/" }];
  }

  const crumbs: Array<{ label: string; href: string }> = [];
  let path = "";

  for (const segment of segments) {
    path += `/${segment}`;
    const label =
      routeLabels[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
    crumbs.push({ label, href: path });
  }

  return crumbs;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const breadcrumbs = buildBreadcrumbs(pathname);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 lg:pl-6 pl-14">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            )}
            {i === breadcrumbs.length - 1 ? (
              <span className="font-medium text-slate-900">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-slate-500 transition-colors hover:text-slate-900"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-100"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-sm font-medium text-white">
            {(user.name ?? user.email).charAt(0).toUpperCase()}
          </div>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
            <div className="border-b border-slate-100 px-3 py-2.5">
              <p className="text-sm font-medium text-slate-900">
                {user.name ?? "User"}
              </p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>

            <div className="py-1">
              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100"
              >
                <User className="h-4 w-4" />
                Profile & Settings
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
