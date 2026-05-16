import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { MAIN_NAV_LINKS } from "@/config/nav";

type FooterProps = {
  variant?: "full" | "minimal";
};

export function Footer({ variant = "full" }: FooterProps) {
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
        {variant === "full" && (
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-muted-foreground sm:gap-8">
            {MAIN_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
