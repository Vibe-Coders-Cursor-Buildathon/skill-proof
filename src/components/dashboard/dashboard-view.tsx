"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Plus,
  Sparkles,
  Trophy,
  Video,
  X,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

type SavedTranscript = {
  videoId: string;
  wordCount: number;
  preview: string;
  sourceUrl?: string;
};

export function DashboardView() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [savedTranscript, setSavedTranscript] = useState<SavedTranscript | null>(null);

  // Redirect to home if not logged in
  useEffect(() => {
    if (user === null) {
      // Small delay so hydration can happen first
      const t = setTimeout(() => router.replace("/"), 50);
      return () => clearTimeout(t);
    }
  }, [user, router]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("skillproof_last_transcript");
      if (raw) {
        setSavedTranscript(JSON.parse(raw) as SavedTranscript);
        sessionStorage.removeItem("skillproof_last_transcript");
      }
    } catch {
      // ignore
    }
  }, []);

  if (!user) return null;

  const planLabel =
    user.plan === "free" ? "Free plan" : user.plan === "individual" ? "Individual" : "Pro";

  return (
    <div className="flex min-h-screen bg-[oklch(0.97_0.01_270)]">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border/60 bg-white lg:flex">
        {/* Logo */}
        <div className="flex h-[4.25rem] items-center gap-3 border-b border-border/50 px-5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
            <GraduationCap className="size-5" strokeWidth={2} />
          </span>
          <span className="text-lg font-bold tracking-tight">SkillProof</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 p-3 pt-4">
          <NavItem icon={LayoutDashboard} label="Dashboard" active />
          <NavItem icon={BookOpen} label="My Courses" href="/dashboard/courses" />
          <NavItem icon={Trophy} label="Certificates" href="/dashboard/certificates" />
        </nav>

        {/* User + logout */}
        <div className="border-t border-border/50 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
              {user.avatarLetter}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{planLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { logout(); router.replace("/"); }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-destructive"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-[4.25rem] items-center justify-between border-b border-border/60 bg-white/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="size-5 text-muted-foreground" />
            <h1 className="text-base font-semibold text-foreground">Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Credits chip */}
            <div className="flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5">
              <Sparkles className="size-3.5 text-indigo-500" />
              <span className="text-sm font-bold text-indigo-700">
                {user.credits} credit{user.credits !== 1 ? "s" : ""} left
              </span>
            </div>

            {/* Generate button */}
            <Button
              size="sm"
              className="btn-gradient h-9 rounded-full px-4 text-sm font-semibold"
              render={<Link href="/#upload" />}
            >
              <Plus className="size-4" />
              Generate course
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          {/* Welcome */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome back, {user.name.split(" ")[0]} 👋
            </h2>
            <p className="mt-1 text-muted-foreground">
              You&apos;re on the <span className="font-semibold text-foreground">{planLabel}</span>.
              {user.credits > 0
                ? ` You have ${user.credits} course generation credit${user.credits !== 1 ? "s" : ""} remaining.`
                : " You've used all your credits for this period."}
            </p>
          </div>

          {savedTranscript && (
            <div className="mb-8 flex gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <CheckCircle2 className="size-5 text-emerald-600" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-emerald-900">
                  Transcript extracted successfully
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-800/80">
                  <Video className="size-3.5" />
                  {savedTranscript.wordCount} words ready · Course generation with Gemini is next
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-emerald-900/70">
                  {savedTranscript.preview}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSavedTranscript(null)}
                className="shrink-0 text-emerald-700/60 hover:text-emerald-900"
                aria-label="Dismiss"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Stats row */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={<Zap className="size-5 text-indigo-500" />}
              bg="bg-indigo-50"
              label="Credits remaining"
              value={String(user.credits)}
              sub="of 3 free credits"
            />
            <StatCard
              icon={<BookOpen className="size-5 text-violet-500" />}
              bg="bg-violet-50"
              label="Courses created"
              value="0"
              sub="Start your first one"
            />
            <StatCard
              icon={<Trophy className="size-5 text-amber-500" />}
              bg="bg-amber-50"
              label="Certificates earned"
              value="0"
              sub="Complete a course quiz"
            />
          </div>

          {/* Empty state — courses */}
          <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center shadow-sm">
            <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100">
              <BookOpen className="size-7 text-indigo-500" />
            </span>
            <h3 className="text-lg font-bold">No courses yet</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Paste a YouTube link, PDF, or article on the homepage and generate your first course in under 60 seconds.
            </p>
            <Button
              className="btn-gradient mt-6 h-10 rounded-full px-6 text-sm font-semibold"
              render={<Link href="/#upload" />}
            >
              <Plus className="size-4" />
              Generate your first course
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  href = "#",
  active = false,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      <Icon className={`size-4 ${active ? "text-indigo-600" : ""}`} />
      {label}
    </Link>
  );
}

function StatCard({
  icon, bg, label, value, sub,
}: {
  icon: React.ReactNode; bg: string; label: string; value: string; sub: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
      <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${bg}`}>
        {icon}
      </span>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}
