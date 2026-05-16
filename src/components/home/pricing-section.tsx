import {
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  Gem,
  Sparkles,
  User,
  X,
} from "lucide-react";

import { PlanSelectButton } from "@/components/pricing/plan-select-button";
import { PRICING_PLANS } from "@/config/pricing";
import type { PricingPlan, PricingPlanId } from "@/config/pricing";
import { cn } from "@/lib/utils";

const PLAN_ICONS: Record<PricingPlanId, typeof User> = {
  free: BookOpen,
  individual: User,
  business: Building2,
  enterprise: Gem,
};

const PLAN_AUDIENCE: Record<PricingPlanId, string> = {
  free: "Explore the platform",
  individual: "Students & solo learners",
  business: "Teams & institutes",
  enterprise: "Organizations at scale",
};

const PLAN_ACCENT: Record<
  PricingPlanId,
  { bar: string; icon: string; pill: string; check: string }
> = {
  free: {
    bar: "from-slate-300 via-slate-200 to-transparent",
    icon: "bg-slate-100 text-slate-600",
    pill: "bg-slate-50 text-slate-700 ring-slate-200/80",
    check: "bg-slate-100 text-slate-600",
  },
  individual: {
    bar: "from-indigo-500 via-violet-500 to-fuchsia-400",
    icon: "bg-indigo-100 text-indigo-600",
    pill: "bg-indigo-50 text-indigo-700 ring-indigo-200/80",
    check: "bg-indigo-100 text-indigo-600",
  },
  business: {
    bar: "from-violet-500 via-purple-500 to-indigo-400",
    icon: "bg-violet-100 text-violet-600",
    pill: "bg-violet-50 text-violet-700 ring-violet-200/80",
    check: "bg-violet-100 text-violet-600",
  },
  enterprise: {
    bar: "from-fuchsia-500 via-violet-600 to-indigo-500",
    icon: "bg-fuchsia-100 text-fuchsia-700",
    pill: "bg-fuchsia-50 text-fuchsia-800 ring-fuchsia-200/80",
    check: "bg-fuchsia-100 text-fuchsia-700",
  },
};

export function PricingSection({ className }: { className?: string }) {
  return (
    <section className={cn("relative overflow-hidden", className ?? "py-3")}>
      <div
        aria-hidden
        className="pricing-surface pointer-events-none absolute inset-0 -z-10"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/80 px-4 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm backdrop-blur-sm">
            <Sparkles className="size-4" />
            Pricing
          </span>
          <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
            Pick the plan that{" "}
            <span className="text-gradient">fits your goals</span>
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Start free, then scale from $10/month. Upgrade for certificates,
            editing, and publishing — all powered by Gemini.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* Trust line */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-indigo-400" />
            1 credit = 1 course generated
          </span>
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-violet-400" />
            Monthly refresh on paid plans
          </span>
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-fuchsia-400" />
            No card required for Free
          </span>
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan }: { plan: PricingPlan }) {
  const Icon = PLAN_ICONS[plan.id];
  const accent = PLAN_ACCENT[plan.id];
  const isFeatured = !!plan.highlighted;
  const canPublish = (plan.publishLimit ?? 0) > 0;
  const included = plan.features.filter((f) => f.included);
  const excluded = plan.features.filter((f) => !f.included);

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[1.625rem] transition-all duration-300",
        isFeatured
          ? "pricing-card-featured z-10 xl:scale-[1.03] xl:-translate-y-1"
          : "border border-white/90 bg-white/85 shadow-[0_4px_32px_-8px_oklch(0.45_0.08_275_/_12%)] backdrop-blur-md hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-10px_oklch(0.45_0.1_275_/_16%)]",
      )}
    >
      {/* Top gradient bar */}
      <div className={cn("h-1 w-full bg-gradient-to-r", accent.bar)} />

      <div className="flex flex-1 flex-col p-6 pt-5">
        {/* Featured badge — in flow, no overlap */}
        {isFeatured && (
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-widest text-white shadow-md shadow-indigo-500/25">
              <Sparkles className="size-3" />
              Best value
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold tracking-tight">{plan.name}</h3>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {PLAN_AUDIENCE[plan.id]}
            </p>
          </div>
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-2xl",
              accent.icon,
            )}
          >
            <Icon className="size-5" strokeWidth={1.75} />
          </span>
        </div>

        {/* Price */}
        <div className="mt-6">
          <div
            className={cn(
              "inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0 rounded-2xl px-4 py-3 ring-1 ring-inset",
              accent.pill,
              plan.id === "free" && "px-5 py-4",
            )}
          >
            <span
              className={cn(
                "font-bold tabular-nums leading-none tracking-tight",
                plan.id === "free" ? "text-4xl" : "text-4xl sm:text-[2.75rem]",
              )}
            >
              {plan.price}
            </span>
            {plan.pricePeriod && (
              <span className="text-base font-semibold text-muted-foreground">
                {plan.pricePeriod}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {plan.id === "free"
              ? "3 credits · no card required"
              : `${plan.credits} course credits per month`}
          </p>
        </div>

        {/* Tagline */}
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          {plan.tagline}
        </p>

        {/* Publish highlight */}
        {canPublish && (
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3.5 py-2.5 text-sm font-medium text-indigo-800">
            <span className="flex items-center gap-2">
              <Check className="size-4 shrink-0 text-indigo-600" strokeWidth={2.5} />
              Publish {plan.publishLimit} public course
              {plan.publishLimit === 1 ? "" : "s"} (admin-approved)
            </span>
          </div>
        )}

        <div className="my-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Included features */}
        <div className="flex-1">
          <p className="mb-3 text-[0.6875rem] font-bold uppercase tracking-widest text-muted-foreground/80">
            What&apos;s included
          </p>
          <ul className="space-y-2.5">
            {included.map((feature) => (
              <li key={feature.label} className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                    isFeatured ? "bg-indigo-600 text-white" : accent.check,
                  )}
                >
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
                <span className="text-sm font-medium leading-snug text-foreground">
                  {feature.label}
                </span>
              </li>
            ))}
          </ul>

          {excluded.length > 0 && (
            <>
              <p className="mb-3 mt-5 text-[0.6875rem] font-bold uppercase tracking-widest text-muted-foreground/50">
                Not included
              </p>
              <ul className="space-y-2">
                {excluded.map((feature) => (
                  <li
                    key={feature.label}
                    className="flex items-start gap-2.5 text-muted-foreground/55"
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted/80">
                      <X className="size-2.5" strokeWidth={2} />
                    </span>
                    <span className="text-sm leading-snug">{feature.label}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* CTA */}
        <PlanSelectButton
          planId={plan.id}
          className={cn(
            "mt-8 h-12 w-full rounded-xl text-sm font-semibold",
            isFeatured
              ? "btn-gradient border-0 shadow-lg"
              : plan.id === "free"
                ? "border-2 border-slate-200 bg-white text-foreground hover:bg-slate-50"
                : "border-2 border-indigo-200/80 bg-white text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50/50",
          )}
          variant={isFeatured ? "default" : "outline"}
        >
          {plan.cta}
          {isFeatured && <ArrowRight className="size-4" />}
        </PlanSelectButton>
      </div>
    </article>
  );
}
