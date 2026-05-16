import type { PricingPlanId } from "@/config/pricing";

/** Paid pricing cards → rows in `plans` table (Supabase). */
export const PRICING_TO_DB_PLAN_SLUG: Record<
  Exclude<PricingPlanId, "free">,
  string
> = {
  individual: "professional",
  business: "premium",
  enterprise: "enterprise",
};

export function getDbPlanSlug(
  pricingPlanId: Exclude<PricingPlanId, "free">,
): string {
  return PRICING_TO_DB_PLAN_SLUG[pricingPlanId];
}

export function isPaidPricingPlanId(
  planId: PricingPlanId,
): planId is Exclude<PricingPlanId, "free"> {
  return planId !== "free";
}
