import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { HeaderAuth } from "@/components/auth/header-auth";
import { HeaderNav } from "@/components/layout/header-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/60 backdrop-blur-2xl">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
            <GraduationCap className="size-5" strokeWidth={2.25} />
          </span>
          <span className="text-xl font-bold tracking-tight text-foreground">
            SkillProof
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 justify-center md:flex">
          <HeaderNav />
        </div>

        <div className="ml-auto shrink-0">
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}
