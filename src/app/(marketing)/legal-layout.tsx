import Link from "next/link";

export function LegalDocLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-background px-4 py-12 text-foreground md:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="mb-8">
          <Link
            href="/login"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ← Back to sign in
          </Link>
        </p>
        <h1 className="mb-8 text-3xl font-semibold tracking-tight">{title}</h1>
        <div className="max-w-none space-y-4 text-sm leading-relaxed text-foreground [&_h2]:text-foreground [&_p]:text-muted-foreground [&_ul]:text-muted-foreground [&_a]:text-primary [&_a]:underline">
          {children}
        </div>
        <footer className="mt-12 border-t border-border pt-8 text-xs text-muted-foreground">
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/privacy" className="hover:text-foreground hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground hover:underline">
              Terms
            </Link>
            <Link href="/data-deletion" className="hover:text-foreground hover:underline">
              Data deletion
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
