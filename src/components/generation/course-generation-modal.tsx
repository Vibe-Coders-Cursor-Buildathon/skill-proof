"use client";

import {
  CheckCircle2,
  FileUp,
  GraduationCap,
  Link2,
  Loader2,
  Mic,
  Video,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGeneration } from "@/contexts/generation-context";
import { getGenerationSubtitle } from "@/lib/content/generation-labels";
import { cn } from "@/lib/utils";
import type { SourceType } from "@/types/upload";

const SOURCE_ICONS: Record<SourceType, typeof Video> = {
  youtube: Video,
  article: Link2,
  pdf: FileUp,
  audio: Mic,
};

export function CourseGenerationModal() {
  const { isOpen, steps, error, payload, closeGeneration } = useGeneration();

  if (!isOpen) return null;

  const sourceType = payload?.sourceType ?? "youtube";
  const SourceIcon = SOURCE_ICONS[sourceType];
  const activeStep = steps.find((s) => s.status === "active");
  const hasError = Boolean(error);

  const sourceLabel = payload?.file?.name ?? payload?.url ?? null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm animate-in fade-in-0 duration-200"
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Creating your course"
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      >
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_32px_80px_-16px_rgba(0,0,0,0.28)] ring-1 ring-black/8 animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

          <div className="px-8 pb-8 pt-7">
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <span className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
                {hasError ? (
                  <X className="size-7" />
                ) : activeStep ? (
                  <Loader2 className="size-7 animate-spin" />
                ) : (
                  <GraduationCap className="size-7" strokeWidth={2} />
                )}
              </span>
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  {hasError ? "Couldn't create course" : "Creating your course"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hasError ? error : getGenerationSubtitle(sourceType)}
                </p>
              </div>
            </div>

            {sourceLabel && !hasError && (
              <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2.5">
                <SourceIcon className="size-4 shrink-0 text-indigo-600" />
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {sourceLabel}
                </p>
              </div>
            )}

            <ol className="space-y-3">
              {steps.map((step) => (
                <li
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300",
                    step.status === "active" && "border-indigo-200 bg-indigo-50/80 shadow-sm",
                    step.status === "done" && "border-emerald-200/80 bg-emerald-50/50",
                    step.status === "error" && "border-destructive/30 bg-destructive/5",
                    step.status === "pending" && "border-transparent bg-muted/20 opacity-60",
                  )}
                >
                  <StepIcon status={step.status} />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      step.status === "active" && "text-indigo-800",
                      step.status === "done" && "text-emerald-800",
                      step.status === "error" && "text-destructive",
                      step.status === "pending" && "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>

            {hasError && (
              <Button
                type="button"
                variant="outline"
                onClick={closeGeneration}
                className="mt-5 w-full rounded-xl"
              >
                Close and try again
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function StepIcon({ status }: { status: "pending" | "active" | "done" | "error" }) {
  if (status === "done") return <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />;
  if (status === "active") return <Loader2 className="size-5 shrink-0 animate-spin text-indigo-600" />;
  if (status === "error") return <X className="size-5 shrink-0 text-destructive" />;
  return (
    <span className="flex size-5 shrink-0 items-center justify-center">
      <span className="size-2 rounded-full bg-muted-foreground/30" />
    </span>
  );
}
