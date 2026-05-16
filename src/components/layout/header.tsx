import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { HeaderAuth } from "@/components/auth/header-auth";

const NAV_LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#how-it-works", label: "How it works" },
] as const;

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
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/80 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <HeaderAuth />
      </div>
    </header>
  );
}
