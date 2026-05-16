"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, Coins, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CREDIT_BUNDLES,
  getCreditPurchaseQuote,
  getCreditsCheckoutPath,
  MIN_CREDIT_PURCHASE,
} from "@/config/credit-purchase";
import { formatPriceCents } from "@/config/pricing";
import { cn } from "@/lib/utils";

export function BuyCreditsSection() {
  const router = useRouter();
  const [customCredits, setCustomCredits] = useState(String(MIN_CREDIT_PURCHASE));
  const [selectedBundle, setSelectedBundle] = useState<number | "custom">(10);
  const [error, setError] = useState<string | null>(null);

  const activeCredits = useMemo(() => {
    if (selectedBundle === "custom") {
      return Number.parseInt(customCredits, 10);
    }
    return selectedBundle;
  }, [selectedBundle, customCredits]);

  const quote = useMemo(() => {
    try {
      if (!Number.isInteger(activeCredits) || activeCredits < MIN_CREDIT_PURCHASE) {
        return null;
      }
      return getCreditPurchaseQuote(activeCredits);
    } catch {
      return null;
    }
  }, [activeCredits]);

  const handleContinue = () => {
    setError(null);
    try {
      if (!quote) {
        setError(`Minimum purchase is ${MIN_CREDIT_PURCHASE} credits`);
        return;
      }
      router.push(getCreditsCheckoutPath(quote.credits));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid amount");
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <Coins className="size-6" />
        </span>
        <div>
          <h3 className="text-lg font-bold">Buy extra credits</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            $1 per credit · minimum {MIN_CREDIT_PURCHASE} credits · bundle
            discounts on 10, 50, and 100
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {CREDIT_BUNDLES.map((bundle) => {
          const bundleQuote = getCreditPurchaseQuote(bundle.credits);
          const isSelected = selectedBundle === bundle.credits;
          return (
            <button
              key={bundle.credits}
              type="button"
              onClick={() => {
                setSelectedBundle(bundle.credits);
                setError(null);
              }}
              className={cn(
                "rounded-2xl border p-4 text-left transition-all",
                isSelected
                  ? "border-indigo-400 bg-indigo-50/80 ring-2 ring-indigo-200"
                  : "border-border/60 bg-white/60 hover:border-indigo-200",
              )}
            >
              <p className="text-2xl font-bold">{bundle.credits}</p>
              <p className="text-xs font-medium text-muted-foreground">credits</p>
              <p className="mt-2 text-lg font-bold text-indigo-700">
                {formatPriceCents(bundleQuote.priceCents)}
              </p>
              {bundleQuote.savingsCents > 0 && (
                <p className="mt-1 text-xs font-semibold text-emerald-700">
                  Save {formatPriceCents(bundleQuote.savingsCents)}
                </p>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-border/60 bg-muted/20 p-4">
        <label className="text-sm font-semibold" htmlFor="custom-credits">
          Custom amount
        </label>
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <div className="min-w-[120px] flex-1">
            <input
              id="custom-credits"
              type="number"
              min={MIN_CREDIT_PURCHASE}
              step={1}
              value={selectedBundle === "custom" ? customCredits : ""}
              placeholder={`Min ${MIN_CREDIT_PURCHASE}`}
              onFocus={() => setSelectedBundle("custom")}
              onChange={(e) => {
                setSelectedBundle("custom");
                setCustomCredits(e.target.value);
                setError(null);
              }}
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          {quote && selectedBundle === "custom" && (
            <p className="text-sm text-muted-foreground">
              Total:{" "}
              <span className="font-bold text-foreground">
                {formatPriceCents(quote.priceCents)}
              </span>
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/50 pt-6">
        <div>
          {quote ? (
            <>
              <p className="text-sm text-muted-foreground">You&apos;ll pay</p>
              <p className="text-2xl font-bold text-indigo-700">
                {formatPriceCents(quote.priceCents)}{" "}
                <span className="text-base font-medium text-muted-foreground">
                  for {quote.credits} credits
                </span>
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter at least {MIN_CREDIT_PURCHASE} credits
            </p>
          )}
        </div>
        <Button
          type="button"
          disabled={!quote}
          onClick={handleContinue}
          className="btn-gradient h-11 rounded-xl border-0 px-6 font-semibold"
        >
          <Sparkles className="size-4" />
          Continue to checkout
          <ArrowRight className="size-4 opacity-80" />
        </Button>
      </div>
    </div>
  );
}
