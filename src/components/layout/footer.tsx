import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="size-4" />
          </span>
          <span>
            SkillProof — Cursor Buildathon 2026 · Colombo
          </span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link href="#features" className="hover:text-foreground">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-foreground">
            How it works
          </Link>
        </div>
      </div>
    </footer>
  );
}
