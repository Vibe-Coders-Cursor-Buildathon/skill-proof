"use client";

import { LogOut, LayoutDashboard, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export function HeaderAuth() {
  const { user, requireAuth, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

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
    <div className="flex items-center gap-2">
      {/* Credits chip */}
      <div className="flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-indigo-50 px-3 py-1.5">
        <Sparkles className="size-3.5 text-indigo-500" />
        <span className="text-xs font-bold text-indigo-700">
          {user.credits} credit{user.credits !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Avatar menu */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full border border-border/60 bg-white/80 py-1.5 pl-1.5 pr-3.5 shadow-sm transition-all hover:shadow-md"
          aria-haspopup="true"
          aria-expanded={menuOpen}
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
            {user.avatarLetter}
          </span>
          <span className="max-w-[100px] truncate text-sm font-semibold text-foreground">
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
                "absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border/50 bg-white shadow-xl ring-1 ring-black/5",
              )}
            >
              {/* User info */}
              <div className="border-b border-border/50 px-4 py-3">
                <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <Sparkles className="size-3 text-indigo-500" />
                  <span className="text-xs font-bold text-indigo-600">
                    {user.credits} credit{user.credits !== 1 ? "s" : ""} remaining
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="py-1">
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
                >
                  <LayoutDashboard className="size-4 text-muted-foreground" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/8"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
