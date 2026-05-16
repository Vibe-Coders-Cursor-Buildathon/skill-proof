"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Coins,
  CreditCard,
  Loader2,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CreditPurchaseQuote } from "@/config/credit-purchase";
import { formatPriceCents } from "@/config/pricing";
import { cn } from "@/lib/utils";

type CreditsCheckoutViewProps = {
  quote: CreditPurchaseQuote;
  userEmail: string;
  userName?: string;
  canceled?: boolean;
};

export function CreditsCheckoutView({
  quote,
  userEmail,
  userName,
  canceled = false,
}: CreditsCheckoutViewProps) {
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (canceled) {
      setError("Payment was canceled. You can try again when ready.");
    }
  }, [canceled]);

  const handlePay = async () => {
    setError(null);
    setIsPaying(true);

    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: quote.credits }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "Could not start checkout");
      }

      if (!data.url) {
        throw new Error("Stripe checkout URL missing");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed to start");
      setIsPaying(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/dashboard?tab=plan"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/80 px-3 py-1 text-xs font-semibold text-indigo-700">
          <Lock className="size-3" />
          Secure checkout · Stripe test mode
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Buy credits
        </h1>
        <p className="mt-2 text-muted-foreground">
          {userName ? `Signed in as ${userName}` : `Signed in as ${userEmail}`}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <div className="lg:col-span-3">
          <div className="glass-card overflow-hidden p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Coins className="size-7" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Credit pack
                </p>
                <p className="mt-1 text-3xl font-bold">{quote.credits} credits</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  1 credit = 1 course generation. Credits never expire.
                </p>
                {quote.savingsCents > 0 && (
                  <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    Save {formatPriceCents(quote.savingsCents)} vs $1/credit
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-card sticky top-24 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="size-5" />
              <span className="text-sm font-semibold">Payment</span>
            </div>

            <div className="mt-6 rounded-2xl border border-border/60 bg-muted/30 p-5">
              <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-4">
                <span className="text-sm text-muted-foreground">
                  {quote.credits} credits
                </span>
                <span className="text-lg font-bold tabular-nums">
                  {formatPriceCents(quote.priceCents)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-4">
                <span className="font-semibold">Total due today</span>
                <span className="text-2xl font-bold tabular-nums text-indigo-700">
                  {formatPriceCents(quote.priceCents)}
                </span>
              </div>
              <p className="mt-2 text-right text-xs text-muted-foreground">
                {formatPriceCents(quote.effectiveUnitCents)} effective per credit
              </p>
            </div>

            {error && (
              <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="button"
              disabled={isPaying}
              onClick={() => void handlePay()}
              className="btn-gradient mt-6 h-12 w-full rounded-2xl border-0 text-base font-semibold"
            >
              {isPaying ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {isPaying
                ? "Redirecting to Stripe…"
                : `Pay ${formatPriceCents(quote.priceCents)}`}
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Test card:{" "}
              <span className="font-mono font-semibold text-foreground">
                4242 4242 4242 4242
              </span>
            </p>

            <div className="mt-6 flex items-start gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2.5 text-xs text-emerald-900">
              <Shield className="mt-0.5 size-4 shrink-0" />
              <span>
                Credits are added to your account right after payment. You&apos;ll
                return to your dashboard automatically.
              </span>
            </div>

            <Link
              href="/dashboard?tab=plan"
              className={cn(
                "mt-4 block text-center text-sm font-semibold text-primary hover:text-indigo-700",
              )}
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
