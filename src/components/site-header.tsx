"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/mode-toggle";

function pageTitleFromPath(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "";
  return last
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function SiteHeader() {
  const pathname = usePathname();
  const title = pageTitleFromPath(pathname);
  const isHome = pathname === "/";

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 lg:px-6">
      <div className="flex w-full items-center gap-1 lg:gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb className="hidden md:block min-w-0 flex-1">
          <BreadcrumbList>
            {!isHome && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link href="/" />}>Social Hub</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <span className="font-medium md:hidden truncate flex-1">{title}</span>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
