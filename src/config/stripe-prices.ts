import type { PricingPlanId } from "@/config/pricing";
import { isPaidPricingPlanId } from "@/config/stripe-plans";

const ENV_KEYS: Record<Exclude<PricingPlanId, "free">, string> = {
  individual: "STRIPE_PRICE_INDIVIDUAL",
  business: "STRIPE_PRICE_BUSINESS",
  enterprise: "STRIPE_PRICE_ENTERPRISE",
};

/**
 * Stripe Price ID from Product Catalog (test mode).
 * Create monthly recurring prices in Dashboard and set env vars.
 */
export function getStripePriceId(
  pricingPlanId: Exclude<PricingPlanId, "free">,
): string {
  const envKey = ENV_KEYS[pricingPlanId];
  const priceId = process.env[envKey]?.trim();

  if (!priceId) {
    throw new Error(
      `${envKey} is not set. In Stripe Dashboard (test mode), create a monthly price for the ${pricingPlanId} plan and add the price_… ID to .env.local.`,
    );
  }

  return priceId;
}

export function hasStripePriceConfigured(
  planId: PricingPlanId,
): planId is Exclude<PricingPlanId, "free"> {
  if (!isPaidPricingPlanId(planId)) return false;
  const envKey = ENV_KEYS[planId];
  return Boolean(process.env[envKey]?.trim());
}
