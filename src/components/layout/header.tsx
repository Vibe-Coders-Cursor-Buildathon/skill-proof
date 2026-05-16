import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/60 backdrop-blur-2xl">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
            <GraduationCap className="size-5" strokeWidth={2.25} />
          </span>
          <span className="text-xl font-bold tracking-tight text-foreground">
            SkillProof
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <a
            href="#features"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/80 hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/80 hover:text-foreground"
          >
            How it works
          </a>
        </nav>

        <Button
          size="sm"
          className="btn-gradient h-10 rounded-full px-5 text-sm font-semibold"
          render={<a href="#upload" />}
        >
          Get started
        </Button>
      </div>
    </header>
  );
}
