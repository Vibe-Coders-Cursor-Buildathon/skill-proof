"use client";

import { BookOpen, Loader2, Sparkles } from "lucide-react";

import type { KnowledgeGapReport } from "@/types/quiz";
import { cn } from "@/lib/utils";

const MINI_LESSON_BODY =
  "text-[1.0625rem] leading-[1.8] tracking-[0.012em] text-foreground/90 [word-spacing:0.04em] sm:text-lg sm:leading-[1.85]";

type WeakAreasCardProps = {
  report: KnowledgeGapReport | null;
  isLoading: boolean;
  error: string | null;
  className?: string;
};

export function WeakAreasCard({
  report,
  isLoading,
  error,
  className,
}: WeakAreasCardProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50/90 to-violet-50/50 p-6 text-left",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <Loader2 className="size-5 animate-spin text-indigo-600" />
          <div>
            <p className="text-sm font-semibold text-indigo-900">
              Analysing your quiz…
            </p>
            <p className="mt-1 text-xs text-indigo-700/80">
              Gemini is building targeted mini-lessons for missed concepts
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-left text-sm text-destructive",
          className,
        )}
      >
        Could not load weak areas: {error}
      </div>
    );
  }

  if (!report?.weakAreas.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/95 via-white to-violet-50/60 p-6 text-left shadow-sm",
        className,
      )}
    >
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/25">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-indigo-950">Your weak areas</h3>
          <p className="mt-1 text-sm text-indigo-800/80">
            Re-study material for concepts you missed — generated for this
            course
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {report.weakAreas.map((area) => (
          <article
            key={area.concept}
            className="rounded-xl border border-white/80 bg-white/90 p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="size-4 shrink-0 text-indigo-600" />
              <h4 className="text-base font-bold text-foreground sm:text-lg">
                {area.concept}
              </h4>
            </div>
            <p className={MINI_LESSON_BODY}>{area.miniLesson}</p>
            {area.keyTakeaways.length > 0 && (
              <ul className="mt-4 space-y-2 border-t border-border/50 pt-4">
                {area.keyTakeaways.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-sm font-medium text-indigo-900/90 sm:text-base"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-indigo-500" />
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
