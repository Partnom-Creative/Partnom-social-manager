"use client";

import type { ComponentProps } from "react";

import { Card } from "@/components/ui/card";
import { authAppearance } from "@/config/auth-appearance";
import { cn } from "@/lib/utils";

type AuthFormCardProps = ComponentProps<typeof Card>;

/**
 * Login / register card — background, transparency, and blur come from
 * `src/config/auth-appearance.ts` (`authAppearance.form`).
 */
export function AuthFormCard({ className, style, ...props }: AuthFormCardProps) {
  const { background, backdropBlurPx } = authAppearance.form;

  return (
    <Card
      className={cn(className)}
      style={{
        background,
        backdropFilter: `blur(${backdropBlurPx}px)`,
        WebkitBackdropFilter: `blur(${backdropBlurPx}px)`,
        ...style,
      }}
      {...props}
    />
  );
}
