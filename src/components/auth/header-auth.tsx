"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export function HeaderAuth() {
  const { user, isLoading, requireAuth, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="h-10 w-24 animate-pulse rounded-full bg-muted/60" />
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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-full border border-border/60 bg-white/80 py-1.5 pr-3.5 pl-1.5 shadow-sm transition-all hover:shadow-md"
        aria-haspopup="true"
        aria-expanded={menuOpen}
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
          {user.avatarLetter}
        </span>
        <span className="max-w-[120px] truncate text-sm font-semibold text-foreground">
          {user.name}
        </span>
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div
            className={cn(
              "absolute top-full right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-border/50 bg-white shadow-xl ring-1 ring-black/5",
            )}
          >
            <div className="border-b border-border/50 px-4 py-3">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
              {user.creditsBalance !== undefined && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {user.creditsBalance} credits
                </p>
              )}
            </div>
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
            >
              <User className="size-4" />
              Dashboard
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/8"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
