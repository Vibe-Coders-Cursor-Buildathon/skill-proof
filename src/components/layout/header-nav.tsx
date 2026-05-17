"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { MAIN_NAV_LINKS } from "@/config/nav";
import { cn } from "@/lib/utils";

function useHash() {
  const [hash, setHash] = useState("");

  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  return hash;
}

function isLinkActive(
  link: (typeof MAIN_NAV_LINKS)[number],
  pathname: string,
  hash: string,
) {
  if (link.active === "home") {
    return pathname === "/" && !hash;
  }
  if (link.active === "hash") {
    return pathname === "/" && hash === (link.hash ?? "");
  }
  if (link.active === "path") {
    return pathname === link.href || pathname.startsWith(`${link.href}/`);
  }
  return false;
}

export function HeaderNav() {
  const pathname = usePathname();
  const hash = useHash();

  return (
    <nav
      aria-label="Primary"
      className="hidden items-center gap-1 rounded-full border border-white/70 bg-white/60 p-1 shadow-sm shadow-indigo-500/5 backdrop-blur-md md:flex"
    >
      {MAIN_NAV_LINKS.map((link) => {
        const active = isLinkActive(link, pathname, hash);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold text-white shadow-md shadow-indigo-500/30"
                : "text-muted-foreground hover:bg-indigo-50/80 hover:text-indigo-700",
            )}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
