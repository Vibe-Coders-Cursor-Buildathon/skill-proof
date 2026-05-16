import type { PricingPlanId } from "@/config/pricing";
import { isPricingPlanId } from "@/config/pricing";
import { fulfillPlanPurchase } from "@/lib/stripe/fulfill-plan";
import { getStripe } from "@/lib/stripe/server";

/**
 * Confirms a completed Checkout session and fulfills the plan.
 * Used on the success page so local dev works without Stripe webhooks.
 * Idempotent — safe if the webhook already ran.
 */
export async function confirmCheckoutSessionForUser(
  sessionId: string,
  userId: string,
) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.status !== "complete") {
    return { fulfilled: false as const, reason: "session_not_complete" as const };
  }

  const sessionUserId =
    session.metadata?.user_id ?? session.client_reference_id ?? null;

  if (!sessionUserId || sessionUserId !== userId) {
    return { fulfilled: false as const, reason: "user_mismatch" as const };
  }

  const pricingPlanId = session.metadata?.pricing_plan_id;
  if (!pricingPlanId || !isPricingPlanId(pricingPlanId)) {
    return { fulfilled: false as const, reason: "invalid_plan" as const };
  }

  const result = await fulfillPlanPurchase({
    userId,
    pricingPlanId: pricingPlanId as PricingPlanId,
    stripeSessionId: session.id,
  });

  return {
    fulfilled: true as const,
    alreadyFulfilled: result.alreadyFulfilled,
    creditsGranted:
      "creditsGranted" in result ? result.creditsGranted : undefined,
    planId: pricingPlanId,
  };
}
