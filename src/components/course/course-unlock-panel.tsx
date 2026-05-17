"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  PREVIEW_CONCEPT_COUNT,
  PREVIEW_FLASHCARD_COUNT,
  PREVIEW_QUIZ_COUNT,
} from "@/config/course-pricing";
import { formatPriceCents } from "@/config/pricing";

type CourseUnlockPanelProps = {
  slug: string;
  priceCents: number;
  totalConcepts: number;
  totalFlashcards: number;
  totalQuiz: number;
  isSignedIn: boolean;
};

export function CourseUnlockPanel({
  slug,
  priceCents,
  totalConcepts,
  totalFlashcards,
  totalQuiz,
  isSignedIn,
}: CourseUnlockPanelProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchase = async () => {
    if (!isSignedIn) {
      router.push(`/?auth=signin&redirect=/courses/${slug}`);
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug: slug }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/95 via-white to-indigo-50/40 p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-900">
            <Lock className="size-3.5" />
            Preview mode
          </span>
          <h3 className="mt-3 text-lg font-bold tracking-tight">
            Unlock the full course
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            You&apos;re viewing {PREVIEW_CONCEPT_COUNT} concept,{" "}
            {PREVIEW_FLASHCARD_COUNT} flashcard, and {PREVIEW_QUIZ_COUNT} quiz
            question. Get full access to all {totalConcepts} concepts,{" "}
            {totalFlashcards} flashcards, and {totalQuiz} quiz questions.
          </p>
          {error && (
            <p className="mt-2 text-sm text-destructive">{error}</p>
          )}
        </div>
        <Button
          type="button"
          disabled={isLoading}
          onClick={() => void purchase()}
          className="btn-gradient h-12 shrink-0 rounded-xl border-0 px-8 text-base font-semibold"
        >
          {isLoading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Sparkles className="size-5" />
          )}
          {isSignedIn
            ? `Unlock for ${formatPriceCents(priceCents)}`
            : "Sign in to purchase"}
        </Button>
      </div>
    </div>
  );
}
