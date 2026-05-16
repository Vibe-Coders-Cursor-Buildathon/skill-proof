"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Loader2,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  formatPriceCents,
  type PricingPlan,
} from "@/config/pricing";
import { clearPendingCheckout } from "@/lib/checkout/pending-checkout";
import { cn } from "@/lib/utils";

type CheckoutViewProps = {
  plan: PricingPlan;
  userEmail: string;
  userName?: string;
  canceled?: boolean;
};

export function CheckoutView({
  plan,
  userEmail,
  userName,
  canceled = false,
}: CheckoutViewProps) {
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clearPendingCheckout();
  }, []);

  useEffect(() => {
    if (canceled) {
      setError("Payment was canceled. You can try again when ready.");
    }
  }, [canceled]);

  const included = plan.features.filter((f) => f.included);
  const isFree = plan.priceCents === 0;

  const handlePay = async () => {
    setError(null);
    setIsPaying(true);

    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
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
        href="/pricing"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to pricing
      </Link>

      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/80 px-3 py-1 text-xs font-semibold text-indigo-700">
          <Lock className="size-3" />
          Secure checkout · Stripe test mode
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Complete your order
        </h1>
        <p className="mt-2 text-muted-foreground">
          {userName ? `Signed in as ${userName}` : `Signed in as ${userEmail}`}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <div className="lg:col-span-3">
          <div className="glass-card overflow-hidden">
            <div className="border-b border-border/50 bg-gradient-to-r from-indigo-50/80 to-violet-50/50 px-6 py-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-indigo-800">
                Order summary
              </h2>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Plan
                  </p>
                  <p className="mt-1 text-2xl font-bold">{plan.name}</p>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    {plan.tagline}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Price
                  </p>
                  <p className="mt-1 text-3xl font-bold tabular-nums text-indigo-700">
                    {plan.price}
                  </p>
                  {plan.pricePeriod && (
                    <p className="text-sm font-medium text-muted-foreground">
                      {plan.pricePeriod}
                    </p>
                  )}
                </div>
              </div>

              <ul className="mt-8 space-y-3">
                {included.slice(0, 6).map((feature) => (
                  <li key={feature.label} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    <span className="text-sm font-medium">{feature.label}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-6 rounded-xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                Includes {plan.credits} course credits per billing cycle.
                {plan.publishLimit
                  ? ` Publish up to ${plan.publishLimit} public courses.`
                  : null}
              </p>
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
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-bold tabular-nums">
                  {formatPriceCents(plan.priceCents)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-4">
                <span className="font-semibold">Total due today</span>
                <span className="text-2xl font-bold tabular-nums text-indigo-700">
                  {formatPriceCents(plan.priceCents)}
                </span>
              </div>
              {!isFree && plan.pricePeriod && (
                <p className="mt-2 text-right text-xs text-muted-foreground">
                  Billed monthly · cancel anytime
                </p>
              )}
            </div>

            {error && (
              <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="button"
              disabled={isPaying || isFree}
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
                : `Pay ${formatPriceCents(plan.priceCents)}${plan.pricePeriod ? " / mo" : ""}`}
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              You&apos;ll be redirected to Stripe&apos;s secure checkout. Use test
              card{" "}
              <span className="font-mono font-semibold text-foreground">
                4242 4242 4242 4242
              </span>{" "}
              in sandbox mode.
            </p>

            <div className="mt-6 flex items-start gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2.5 text-xs text-emerald-900">
              <Shield className="mt-0.5 size-4 shrink-0" />
              <span>
                Payments are processed by Stripe. Your plan and credits update
                automatically after payment.
              </span>
            </div>

            <Link
              href="/dashboard"
              className={cn(
                "mt-4 block text-center text-sm font-semibold text-primary hover:text-indigo-700",
              )}
            >
              Go to dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
