"use client";

import * as React from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const MAX_BYTES = 1_500_000; // ~1.5MB data URL cap for DB storage

export type IdentityAvatarFieldProps = {
  /** Current image URL (http(s) or data URL) */
  value: string | null;
  onChange: (next: string | null) => void;
  /** Text used for fallback initials when no image */
  fallbackFrom: string;
  /** Visual size */
  size?: "sm" | "md" | "lg";
  /** Square (app logo) vs round (user) */
  variant?: "rounded" | "square";
  className?: string;
};

function initialsFrom(text: string) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function IdentityAvatarField({
  value,
  onChange,
  fallbackFrom,
  size = "md",
  variant = "rounded",
  className,
}: IdentityAvatarFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  const dim =
    size === "sm" ? "h-10 w-10" : size === "lg" ? "h-16 w-16" : "h-12 w-12";
  const rounded = variant === "square" ? "rounded-lg" : "rounded-full";

  function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (PNG, JPG, or WebP).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be under 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") onChange(result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar
          className={cn(
            dim,
            rounded,
            variant === "square" && "[&>[data-slot=avatar-fallback]]:rounded-lg"
          )}
        >
          {value ? (
            <AvatarImage src={value} alt="" className={cn("object-cover", rounded)} />
          ) : null}
          <AvatarFallback
            className={cn(
              rounded,
              variant === "square"
                ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground"
                : "bg-muted font-medium text-muted-foreground"
            )}
          >
            {initialsFrom(fallbackFrom || "?")}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            {value ? "Replace image" : "Upload image"}
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => onChange(null)}
            >
              <X className="mr-1 h-4 w-4" />
              Remove
            </Button>
          ) : null}
        </div>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <p className="text-xs text-muted-foreground">
        PNG, JPG, or WebP. Max 1.5 MB. Shown in the sidebar and settings.
      </p>
    </div>
  );
}
