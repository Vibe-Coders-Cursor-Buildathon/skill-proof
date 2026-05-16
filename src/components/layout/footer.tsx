import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/50 bg-white/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-12 sm:flex-row sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600/10 to-violet-600/10 text-primary">
            <GraduationCap className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">SkillProof</p>
            <p className="text-xs text-muted-foreground">
              Cursor Buildathon 2026 · Colombo
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-muted-foreground sm:gap-8">
          <Link href="/courses" className="transition-colors hover:text-primary">
            Courses
          </Link>
          <Link href="/#pricing" className="transition-colors hover:text-primary">
            Pricing
          </Link>
          <Link href="/#features" className="transition-colors hover:text-primary">
            Features
          </Link>
          <Link href="/#how-it-works" className="transition-colors hover:text-primary">
            How it works
          </Link>
        </div>
      </div>
    </footer>
  );
}
