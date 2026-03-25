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
      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center px-4 pb-10 pt-8">
        <div className="w-full max-w-md flex-1">{children}</div>
        <footer className="mt-8 flex w-full max-w-md flex-wrap justify-center gap-x-4 gap-y-1 text-center text-xs text-white/50">
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
