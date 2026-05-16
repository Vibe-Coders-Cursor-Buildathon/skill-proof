import type { PricingPlanId } from "@/config/pricing";

/** Paid pricing cards → rows in `plans` table (Supabase). 1:1 slug mapping. */
export const PRICING_TO_DB_PLAN_SLUG: Record<
  Exclude<PricingPlanId, "free">,
  string
> = {
  individual: "individual",
  business: "business",
  enterprise: "enterprise",
};

export const FREE_DB_PLAN_SLUG = "free";

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
