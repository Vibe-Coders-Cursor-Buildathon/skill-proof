"use client";

import { CheckCircle2, Sparkles, X } from "lucide-react";

type WelcomeBannerProps = {
  userName?: string;
  hasSavedLink?: boolean;
  onDismiss: () => void;
};

export function WelcomeBanner({
  userName,
  hasSavedLink,
  onDismiss,
}: WelcomeBannerProps) {
  const firstName = userName?.split(" ")[0] ?? "there";

  return (
    <div
      role="status"
      className="mx-auto mb-6 max-w-2xl animate-in fade-in-0 slide-in-from-top-2 duration-500"
    >
      <div className="relative isolate overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-indigo-50/80 p-5 shadow-lg shadow-emerald-500/10 sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 -z-10 h-44 w-44 rounded-full bg-gradient-to-br from-emerald-200/40 to-transparent blur-3xl"
        />
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3 right-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-white/80 hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>

        <div className="flex gap-4 pr-8">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25">
            <CheckCircle2 className="size-6" strokeWidth={2.25} />
          </span>
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Email confirmed
            </p>
            <h2 className="text-balance text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Welcome, {firstName}! You&apos;re ready to create your first
              course.
            </h2>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {hasSavedLink
                ? "We saved your link below. Review it and click Generate course — we'll extract the transcript and build your course."
                : "Paste a YouTube link below, pick language and difficulty, then click Generate course."}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                <Sparkles className="size-3.5" />
                Free credits on your account
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Step 1 of 3 · Paste link → Generate → Dashboard
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
