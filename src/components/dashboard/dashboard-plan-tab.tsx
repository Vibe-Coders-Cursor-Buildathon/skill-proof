import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Check, Crown, Sparkles } from "lucide-react";

import { BuyCreditsSection } from "@/components/dashboard/buy-credits-section";
import { CertificateBrandingSection } from "@/components/dashboard/certificate-branding-section";
import { CreditsPurchaseSuccess } from "@/components/dashboard/credits-purchase-success";
import { PRICING_PLANS } from "@/config/pricing";
import { cn } from "@/lib/utils";

type DashboardPlanTabProps = {
  planName: string;
  credits: number;
  creditsMax: number;
};

export function DashboardPlanTab({
  planName,
  credits,
  creditsMax,
}: DashboardPlanTabProps) {
  const creditsUsed = Math.max(0, creditsMax - credits);
  const creditsPercent =
    creditsMax > 0 ? Math.min(100, (credits / creditsMax) * 100) : 0;
  const lowCredits = credits <= 1;

  const matchedPlan =
    PRICING_PLANS.find(
      (p) => p.name.toLowerCase() === planName.toLowerCase(),
    ) ?? PRICING_PLANS[0];

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <CreditsPurchaseSuccess />
      </Suspense>

      <BuyCreditsSection />

      <CertificateBrandingSection />

      <div
        className={cn(
          "glass-card overflow-hidden p-6 sm:p-8",
          lowCredits && "ring-1 ring-amber-200/60",
        )}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/70 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Sparkles className="size-3" />
              Credit balance
            </span>
            <p className="mt-4 text-5xl font-bold tracking-tight">{credits}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              credits remaining · {creditsUsed} of {creditsMax} used
            </p>
          </div>
          <div className="w-full sm:max-w-xs">
            <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
              <span>Usage</span>
              <span>{Math.round(creditsPercent)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  lowCredits
                    ? "bg-gradient-to-r from-amber-400 to-amber-500"
                    : "bg-gradient-to-r from-indigo-500 to-violet-500",
                )}
                style={{ width: `${creditsPercent}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Each course generation uses 1 credit. Credits reset with your plan
              cycle.
            </p>
          </div>
        </div>
        {lowCredits && (
          <p className="mt-6 text-sm text-amber-800">
            Running low — buy extra credits below or{" "}
            <Link href="/pricing" className="font-semibold underline">
              upgrade your plan
            </Link>
            .
          </p>
        )}
      </div>

      <div className="glass-card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <Crown className="size-6" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Your plan
            </p>
            <h3 className="mt-1 text-2xl font-bold capitalize">{planName}</h3>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              {matchedPlan.tagline}
            </p>
          </div>
        </div>

        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {matchedPlan.features.slice(0, 6).map((feature) => (
            <li
              key={feature.label}
              className={cn(
                "flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm",
                feature.included
                  ? "border-border/60 bg-white/60"
                  : "border-border/40 bg-muted/30 text-muted-foreground",
              )}
            >
              <Check
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  feature.included
                    ? "text-emerald-600"
                    : "text-muted-foreground/40",
                )}
              />
              <span>{feature.label}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/pricing"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-indigo-700"
        >
          Compare all plans
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
