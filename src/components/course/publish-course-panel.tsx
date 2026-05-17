"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Globe, Loader2, Clock, CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  MAX_COURSE_PRICE_CENTS,
  MIN_COURSE_PRICE_CENTS,
  parsePriceDollarsToCents,
} from "@/config/course-pricing";
import { formatPriceCents } from "@/config/pricing";
import {
  publishStatusLabel,
  type PublishStatus,
} from "@/lib/courses/publish-status";
import { cn } from "@/lib/utils";

type PublishCoursePanelProps = {
  slug: string;
  publishStatus: PublishStatus;
  publishSlotsUsed: number;
  publishSlotsMax: number;
  rejectionReason?: string | null;
  currentPriceCents?: number | null;
};

export function PublishCoursePanel({
  slug,
  publishStatus,
  publishSlotsUsed,
  publishSlotsMax,
  rejectionReason,
  currentPriceCents = null,
}: PublishCoursePanelProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [priceDollars, setPriceDollars] = useState(
    currentPriceCents != null ? (currentPriceCents / 100).toFixed(2) : "9.99",
  );

  const slotsRemaining = Math.max(0, publishSlotsMax - publishSlotsUsed);
  const canSubmit =
    publishStatus === "draft" || publishStatus === "rejected";
  const atLimit = slotsRemaining <= 0 && canSubmit;

  const submitForReview = async () => {
    setError(null);
    setMessage(null);
    const priceCents = parsePriceDollarsToCents(Number(priceDollars));
    if (priceCents == null) {
      setError(
        `Enter a price between ${formatPriceCents(MIN_COURSE_PRICE_CENTS)} and ${formatPriceCents(MAX_COURSE_PRICE_CENTS)}.`,
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/courses/${slug}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_cents: priceCents }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        code?: string;
      };
      if (!res.ok) {
        throw new Error(
          data.code === "schema_outdated"
            ? data.error ??
                "Database update required — run Supabase migrations 00011 and 00012."
            : data.error ?? "Failed to submit for review",
        );
      }
      setMessage(
        data.message ??
          "Submitted for admin review. You will be notified when it is live.",
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawRequest = async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/courses/${slug}/publish`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to withdraw request");
      }
      setMessage("Publish request withdrawn.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50/90 to-violet-50/50 p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
          <Globe className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-foreground">Public catalog</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit this course for admin review to list it on the public
            courses page. Set a price — visitors get a free preview, then pay
            to unlock all content. Learners who pass the quiz (70%+) receive a
            SkillProof certificate with your logo from the Plan tab. Your
            Business plan includes up to <strong>{publishSlotsMax}</strong> live
            or pending courses ({slotsRemaining} slot
            {slotsRemaining === 1 ? "" : "s"} left).
          </p>

          {canSubmit && (
            <label className="mt-4 block">
              <span className="text-sm font-semibold">Course price (USD)</span>
              <div className="mt-1.5 flex max-w-xs items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  min={MIN_COURSE_PRICE_CENTS / 100}
                  max={MAX_COURSE_PRICE_CENTS / 100}
                  step="0.01"
                  value={priceDollars}
                  onChange={(e) => setPriceDollars(e.target.value)}
                  className="h-11 flex-1 rounded-xl border border-border/80 bg-white px-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <span className="mt-1 block text-xs text-muted-foreground">
                Learners preview 1 concept, 1 flashcard, and 1 quiz question.
              </span>
            </label>
          )}

          {currentPriceCents != null && !canSubmit && (
            <p className="mt-3 text-sm font-semibold text-indigo-700">
              Listed at {formatPriceCents(currentPriceCents)}
            </p>
          )}

          <StatusRow status={publishStatus} />

          {publishStatus === "rejected" && rejectionReason && (
            <p className="mt-2 rounded-lg border border-red-200/80 bg-red-50/80 px-3 py-2 text-sm text-red-800">
              {rejectionReason}
            </p>
          )}

          {error && (
            <p className="mt-2 text-sm text-destructive">{error}</p>
          )}
          {message && (
            <p className="mt-2 text-sm font-medium text-emerald-700">
              {message}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {canSubmit && (
              <Button
                type="button"
                disabled={isLoading || atLimit}
                onClick={() => void submitForReview()}
                className="btn-gradient h-10 rounded-xl border-0 px-5 font-semibold"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Globe className="size-4" />
                )}
                {publishStatus === "rejected"
                  ? "Resubmit for review"
                  : "Submit for review"}
              </Button>
            )}
            {publishStatus === "pending" && (
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                className="h-10 rounded-xl"
                onClick={() => void withdrawRequest()}
              >
                Withdraw request
              </Button>
            )}
          </div>

          {atLimit && (
            <p className="mt-2 text-xs text-amber-800">
              You have used all {publishSlotsMax} publish slots. Unpublish or
              withdraw a pending course to free a slot.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusRow({ status }: { status: PublishStatus }) {
  const config: Record<
    PublishStatus,
    { icon: typeof Clock; className: string }
  > = {
    draft: { icon: Globe, className: "text-muted-foreground" },
    pending: { icon: Clock, className: "text-amber-700" },
    approved: { icon: CheckCircle2, className: "text-emerald-700" },
    rejected: { icon: XCircle, className: "text-red-700" },
  };

  const { icon: Icon, className } = config[status];

  return (
    <p
      className={cn(
        "mt-3 inline-flex items-center gap-2 text-sm font-semibold",
        className,
      )}
    >
      <Icon className="size-4" />
      {publishStatusLabel(status)}
      {status === "pending" && (
        <span className="font-normal text-muted-foreground">
          — an admin will review before it appears on /courses
        </span>
      )}
    </p>
  );
}
