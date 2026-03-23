"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, ShieldCheck, Trash2 } from "lucide-react";

export function TeamRowActions({ memberId }: { memberId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link href={`/team/${memberId}`}>
          <DropdownMenuItem>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </DropdownMenuItem>
        </Link>
        <Link href={`/team/${memberId}#access`}>
          <DropdownMenuItem>
            <ShieldCheck className="h-3.5 w-3.5" />
            Manage Access
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Link href={`/team/${memberId}#delete`}>
          <DropdownMenuItem className="text-red-600 hover:!bg-red-50 hover:!text-red-700">
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
