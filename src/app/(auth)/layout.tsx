import Link from "next/link";
import { InteractiveDotGridBackground } from "@/components/interactive-dot-grid";
import { authAppearance } from "@/config/auth-appearance";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative min-h-svh overflow-hidden"
      style={{ background: authAppearance.pageBackground }}
    >
      <InteractiveDotGridBackground />
      <div className="relative z-10 flex min-h-svh flex-col items-center px-4 pb-10 pt-8">
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <footer className="mt-auto flex w-full max-w-md shrink-0 flex-wrap justify-center gap-x-4 gap-y-1 pt-8 text-center text-xs text-white/50">
          <Link href="/privacy" className="hover:text-white/80 hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white/80 hover:underline">
            Terms
          </Link>
          <Link href="/data-deletion" className="hover:text-white/80 hover:underline">
            Data deletion
          </Link>
        </footer>
      </div>
    </div>
  );
}
