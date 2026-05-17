import Link from "next/link";
import { GraduationCap, Heart } from "lucide-react";

import { MAIN_NAV_LINKS } from "@/config/nav";

type FooterProps = {
  variant?: "full" | "minimal";
};

const RESOURCE_LINKS: { href: string; label: string }[] = [
  { href: "/courses", label: "Browse courses" },
  { href: "/pricing", label: "Pricing & credits" },
  { href: "/about", label: "About SkillProof" },
  { href: "/contact", label: "Contact us" },
];

export function Footer({ variant = "full" }: FooterProps) {
  if (variant === "minimal") {
    return (
      <footer className="mt-auto border-t border-white/50 bg-white/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600/10 to-violet-600/10 text-primary">
              <GraduationCap className="size-4" />
            </span>
            <p className="text-sm font-semibold text-foreground">SkillProof</p>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SkillProof
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-white/50 bg-white/40 backdrop-blur-xl">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-48 w-[640px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-200/40 via-violet-200/20 to-transparent blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
                <GraduationCap className="size-5" strokeWidth={2.25} />
              </span>
              <span className="text-lg font-bold tracking-tight text-foreground">
                SkillProof
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Turn any content into a verified micro-course in 60 seconds —
              flashcards, adaptive quizzes, and certificates included.
            </p>
            <p className="text-xs font-medium text-muted-foreground/80">
              Cursor Buildathon 2026 · Colombo
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
              Navigate
            </p>
            <ul className="space-y-2.5">
              {MAIN_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
              Resources
            </p>
            <ul className="space-y-2.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/60 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SkillProof. All rights reserved.
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            Built with{" "}
            <Heart className="size-3.5 text-rose-500" fill="currentColor" />{" "}
            using Cursor & Gemini
          </p>
        </div>
      </div>
    </footer>
  );
}
