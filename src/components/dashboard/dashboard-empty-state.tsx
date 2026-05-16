import Link from "next/link";
import { ArrowRight, GraduationCap, Plus, Sparkles } from "lucide-react";

export function DashboardEmptyState() {
  return (
    <div className="glass-card relative overflow-hidden px-6 py-16 text-center sm:px-12 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5" />
      <div className="relative mx-auto max-w-md">
        <span className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 shadow-inner">
          <GraduationCap className="size-10" strokeWidth={1.5} />
        </span>
        <h3 className="mt-6 text-xl font-bold tracking-tight">
          Your library is empty
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Paste a YouTube link, PDF, or article and Gemini will turn it into a
          full micro-course — summary, flashcards, and quiz — in under 60
          seconds.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/#upload"
            className="btn-gradient inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold"
          >
            <Plus className="size-4" />
            Create my first course
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-2xl border border-border/80 bg-white/80 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
          >
            Browse community
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <p className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-indigo-500" />
          Powered by Gemini 2.5 Flash
        </p>
      </div>
    </div>
  );
}
