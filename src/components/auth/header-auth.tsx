"use client";

import Link from "next/link";
import { ChevronDown, Loader2, LogOut, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export function HeaderAuth() {
  const { user, isLoading, isLoggingOut, requireAuth, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      setMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-16 animate-pulse rounded-full bg-indigo-100" />
        <div className="size-9 animate-pulse rounded-full bg-indigo-100" />
      </div>
    );
  }

  if (!user) {
    return (
      <Button
        size="sm"
        onClick={() => requireAuth()}
        className="btn-gradient h-10 rounded-full px-5 text-sm font-semibold"
      >
        Sign in
      </Button>
    );
  }

  const isAdmin = user.role === "admin";
  const credits = user.creditsBalance ?? 0;
  const hasLowCredits = credits === 0;
  const dashboardHref = isAdmin ? "/admin" : "/dashboard";

  return (
    <div className="flex items-center gap-2">
      {!isAdmin && (
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold shadow-sm sm:px-3",
            hasLowCredits
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-indigo-200 bg-indigo-50 text-indigo-800",
          )}
        >
          <Sparkles className="size-3 shrink-0" />
          <span>{credits}</span>
          <span className="hidden sm:inline">
            credit{credits !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-white py-1 pl-1 pr-2 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md sm:gap-2 sm:pr-3"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Account menu"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white">
            {user.avatarLetter}
          </span>
          <span className="hidden max-w-[88px] truncate text-sm font-semibold text-foreground sm:inline">
            {user.name}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              menuOpen && "rotate-180",
            )}
          />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute top-full right-0 z-[100] mt-2 w-56 overflow-hidden rounded-2xl border border-border/60 bg-white shadow-xl ring-1 ring-black/5"
          >
            <div className="border-b border-border/50 px-4 py-3">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
              {!isAdmin && (
                <div
                  className={cn(
                    "mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                    hasLowCredits
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-indigo-200 bg-indigo-50 text-indigo-800",
                  )}
                >
                  <Sparkles className="size-3" />
                  {credits} credit{credits !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            {!isAdmin && (
              <Link
                href={dashboardHref}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
              >
                <User className="size-4" />
                Dashboard
              </Link>
            )}

            <button
              type="button"
              role="menuitem"
              disabled={isLoggingOut}
              onClick={() => {
                setMenuOpen(false);
                void logout();
              }}
              className={cn(
                "flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-60",
                !isAdmin && "border-t border-border/50",
              )}
            >
              {isLoggingOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              {isLoggingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
