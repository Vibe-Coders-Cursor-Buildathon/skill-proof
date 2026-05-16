import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { HeaderAuth } from "@/components/auth/header-auth";
import { Footer } from "@/components/layout/footer";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-mesh bg-grid-pattern relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-white/40 bg-white/60 backdrop-blur-2xl">
        <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/admin" className="group flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
              <GraduationCap className="size-5" strokeWidth={2.25} />
            </span>
            <span className="text-xl font-bold tracking-tight text-foreground">
              SkillProof
            </span>
          </Link>
          <HeaderAuth />
        </div>
      </header>
      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6">
        {children}
      </main>
      <Footer variant="minimal" />
    </div>
  );
}
