"use client";

import type { ComponentType } from "react";
import {
  Calendar,
  ChevronRight,
  LayoutGrid,
  Loader2,
  Mail,
  Palette,
  Type,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const PLATFORM_BADGE_CLASSES: Record<string, string> = {
  TWITTER: "bg-slate-900 text-white border-slate-900",
  LINKEDIN: "bg-blue-600 text-white border-blue-600",
  YOUTUBE: "bg-red-600 text-white border-red-600",
  INSTAGRAM: "bg-pink-600 text-white border-pink-600",
  SUBSTACK: "bg-orange-600 text-white border-orange-600",
};

const SEMANTIC_SWATCHES: { label: string; className: string }[] = [
  { label: "background", className: "bg-background border border-border" },
  { label: "foreground", className: "bg-foreground" },
  { label: "card", className: "bg-card border border-border" },
  { label: "muted", className: "bg-muted border border-border" },
  { label: "accent", className: "bg-accent border border-border" },
  { label: "brand", className: "bg-brand border border-border" },
  {
    label: "brand-foreground",
    className: "bg-brand-foreground border border-border",
  },
  { label: "primary", className: "bg-primary" },
  { label: "secondary", className: "bg-secondary border border-border" },
  { label: "destructive", className: "bg-destructive" },
  { label: "border", className: "bg-border border border-border" },
  { label: "ring", className: "bg-ring border border-border" },
  { label: "chart-1", className: "bg-chart-1" },
  { label: "chart-2", className: "bg-chart-2" },
  { label: "chart-3", className: "bg-chart-3" },
  { label: "chart-4", className: "bg-chart-4" },
  { label: "chart-5", className: "bg-chart-5" },
  { label: "sidebar", className: "bg-sidebar border border-sidebar-border" },
  { label: "skeleton", className: "bg-skeleton border border-border" },
];

function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-24 space-y-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
        )}
        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

export function DesignSystemShowcase() {
  return (
    <main className="mx-auto max-w-5xl flex-1 space-y-16 px-6 py-12 text-foreground">
      <p className="text-sm leading-relaxed text-muted-foreground">
        This page is only the design workspace: same tokens as the app (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          globals.css
        </code>
        ) and shared primitives in{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          src/components/ui
        </code>
        , without the dashboard layout or navigation. Use the header to switch
        light/dark and compare themes.
      </p>

      <Section
        title="Semantic colors"
        description="CSS variables mapped in @theme — use bg-*, text-*, border-* in components."
        icon={Palette}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {SEMANTIC_SWATCHES.map(({ label, className }) => (
            <div
              key={label}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm"
            >
              <div
                className={`h-14 w-full rounded-lg ${className}`}
                aria-hidden
              />
              <span className="font-mono text-xs text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Typography"
        description="Geist Sans (body) and Geist Mono — font-sans / font-mono."
        icon={Type}
      >
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <p className="text-3xl font-semibold tracking-tight">
            Heading display
          </p>
          <p className="text-2xl font-semibold tracking-tight">
            Section title
          </p>
          <p className="text-lg font-medium">Lead paragraph</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Muted body copy for descriptions, helper text, and secondary
            labels. Antialiased by default on{" "}
            <code className="font-mono text-xs">body</code>.
          </p>
          <p className="font-mono text-sm">
            const theme = &quot;dark&quot; — monospace for code and tokens
          </p>
        </div>
      </Section>

      <Section
        title="Buttons"
        description="Default / brand use the accent (#E4FB0D); secondary & outline for quieter actions."
      >
        <div className="flex flex-wrap gap-2">
          <Button>Default (primary)</Button>
          <Button variant="brand">Brand</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" variant="outline" aria-label="Calendar">
            <Calendar className="size-4" />
          </Button>
        </div>
      </Section>

      <Section title="Badges" description="Badge variants; plain + classes for brand colors.">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="ghost">Ghost</Badge>
          <Badge variant="plain" className="bg-violet-600 text-white">
            Plain
          </Badge>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Platform badges (posts / calendar)
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PLATFORM_BADGE_CLASSES).map(([platform, cls]) => (
              <Badge key={platform} variant="outline" className={cls}>
                {platform}
              </Badge>
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="Status badges"
        description="Post and invite states — status-badge.tsx."
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="DRAFT" />
          <StatusBadge status="SCHEDULED" />
          <StatusBadge status="PUBLISHING" />
          <StatusBadge status="PUBLISHED" />
          <StatusBadge status="FAILED" />
          <StatusBadge status="PENDING" />
          <StatusBadge status="ACCEPTED" />
          <StatusBadge status="ACTIVE" />
          <StatusBadge status="EXPIRED" />
        </div>
      </Section>

      <Section title="Form controls">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ds-input">Label</Label>
            <Input id="ds-input" placeholder="Placeholder text" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ds-select">Select</Label>
            <Select defaultValue="editor">
              <SelectTrigger id="ds-select" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="ds-textarea">Textarea</Label>
            <Textarea
              id="ds-textarea"
              placeholder="Multi-line content…"
              className="min-h-[88px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="ds-check" defaultChecked />
            <Label htmlFor="ds-check">Checkbox</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="ds-switch" defaultChecked />
            <Label htmlFor="ds-switch">Switch</Label>
          </div>
        </div>
      </Section>

      <Section title="Card">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>
              Description uses muted foreground.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Card body with ring-1 ring-foreground/10 from the primitive.
            </p>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
            <Button size="sm">Save</Button>
          </CardFooter>
        </Card>
      </Section>

      <Section title="Tabs">
        <Tabs defaultValue="one" className="max-w-md">
          <TabsList>
            <TabsTrigger value="one">First</TabsTrigger>
            <TabsTrigger value="two">Second</TabsTrigger>
          </TabsList>
          <TabsContent value="one" className="rounded-lg border border-border p-4">
            Default tabs: muted list, active panel on background.
          </TabsContent>
          <TabsContent value="two" className="rounded-lg border border-border p-4">
            Second panel content.
          </TabsContent>
        </Tabs>
        <Tabs defaultValue="a" className="max-w-md">
          <TabsList variant="line">
            <TabsTrigger value="a">Line A</TabsTrigger>
            <TabsTrigger value="b">Line B</TabsTrigger>
          </TabsList>
          <TabsContent value="a" className="pt-3 text-sm text-muted-foreground">
            Line variant underline indicator.
          </TabsContent>
          <TabsContent value="b" className="pt-3 text-sm text-muted-foreground">
            Tab B.
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">App</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="size-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Section</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Current</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Section>

      <Section title="Separator">
        <div className="flex h-24 items-stretch gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <span className="text-xs text-muted-foreground">Horizontal</span>
            <Separator />
          </div>
          <div className="flex gap-2">
            <span className="text-xs text-muted-foreground">Vertical</span>
            <Separator orientation="vertical" />
          </div>
        </div>
      </Section>

      <Section title="Skeleton">
        <div className="flex max-w-sm flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </Section>

      <Section title="Avatar">
        <div className="flex flex-wrap items-center gap-6">
          <Avatar>
            <AvatarFallback>SH</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarFallback className="text-xs">S</AvatarFallback>
          </Avatar>
          <AvatarGroup>
            <Avatar>
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>B</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+3</AvatarGroupCount>
          </AvatarGroup>
        </div>
      </Section>

      <Section title="Dialog & dropdown">
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              Open dialog
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Example dialog</DialogTitle>
                <DialogDescription>
                  Uses rounded-xl surface, ring, and backdrop blur on the
                  overlay.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="secondary">
                  Secondary
                </Button>
                <Button type="button">Primary</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              Menu
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>
                <Mail className="size-4" />
                Item one
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LayoutGrid className="size-4" />
                Item two
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Section>

      <Section
        title="App chrome (calendar)"
        description="Zinc surfaces and accents used on PostCalendar and similar views."
        icon={LayoutGrid}
      >
        <div className="overflow-hidden rounded-2xl bg-zinc-950 p-4 text-zinc-100 ring-1 ring-zinc-800 md:p-5">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium">March 2026</span>
            <Loader2 className="size-4 animate-spin text-zinc-500" />
          </div>
          <div className="grid grid-cols-7 border-b border-zinc-800 pb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((L, i) => (
              <div
                key={`${L}-${i}`}
                className="flex justify-center px-1 py-1.5 text-xs font-medium text-zinc-500"
              >
                <span
                  className={i === 6 ? "text-sky-400" : "text-zinc-500"}
                >
                  {L}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1 pt-2">
            {Array.from({ length: 7 }, (_, d) => (
              <div
                key={d}
                className="flex min-h-[40px] flex-col items-start gap-1 rounded-lg px-1 py-1.5 hover:bg-zinc-900/80"
              >
                <span className="flex size-7 items-center justify-center rounded-lg text-xs text-zinc-200">
                  {d + 1}
                </span>
                {d === 2 && (
                  <span className="size-1.5 rounded-full bg-teal-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Radius">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="size-16 rounded-sm bg-primary" />
            <span className="font-mono text-xs text-muted-foreground">
              rounded-sm
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="size-16 rounded-md bg-primary" />
            <span className="font-mono text-xs text-muted-foreground">
              rounded-md
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="size-16 rounded-lg bg-primary" />
            <span className="font-mono text-xs text-muted-foreground">
              rounded-lg
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="size-16 rounded-xl bg-primary" />
            <span className="font-mono text-xs text-muted-foreground">
              rounded-xl
            </span>
          </div>
        </div>
      </Section>
    </main>
  );
}
