"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function TeamSearch({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(defaultValue ?? "");

  const updateSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams();
      if (term.trim()) {
        params.set("search", term.trim());
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname]
  );

  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        placeholder="Search by name or email..."
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          updateSearch(e.target.value);
        }}
        className="pl-9"
      />
    </div>
  );
}
