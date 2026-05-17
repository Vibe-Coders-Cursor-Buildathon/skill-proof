import type { PricingPlanId } from "@/config/pricing";
import { isPricingPlanId } from "@/config/pricing";
import { fulfillCoursePurchase } from "@/lib/stripe/fulfill-course";
import { fulfillCreditPurchase } from "@/lib/stripe/fulfill-credits";
import { fulfillPlanPurchase } from "@/lib/stripe/fulfill-plan";
import { getStripe } from "@/lib/stripe/server";

export type ConfirmCheckoutResult =
  | {
      fulfilled: false;
      reason:
        | "session_not_complete"
        | "user_mismatch"
        | "invalid_checkout";
    }
  | {
      fulfilled: true;
      checkoutType: "plan";
      alreadyFulfilled: boolean;
      planId: PricingPlanId;
      creditsGranted?: number;
    }
  | {
      fulfilled: true;
      checkoutType: "credits";
      alreadyFulfilled: boolean;
      creditsGranted: number;
    }
  | {
      fulfilled: true;
      checkoutType: "course";
      alreadyFulfilled: boolean;
      courseSlug: string;
    };

/**
 * Confirms a completed Checkout session and fulfills plan or credits.
 * Idempotent — safe if the webhook already ran.
 */
export async function confirmCheckoutSessionForUser(
  sessionId: string,
  userId: string,
): Promise<ConfirmCheckoutResult> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.status !== "complete") {
    return { fulfilled: false, reason: "session_not_complete" };
  }

  const sessionUserId =
    session.metadata?.user_id ?? session.client_reference_id ?? null;

  if (!sessionUserId || sessionUserId !== userId) {
    return { fulfilled: false, reason: "user_mismatch" };
  }

  const checkoutType = session.metadata?.checkout_type ?? "plan";

  if (checkoutType === "course") {
    const courseId = session.metadata?.course_id;
    const courseSlug = session.metadata?.course_slug;
    const priceCents = Number(session.metadata?.price_cents);

    if (
      !courseId ||
      !courseSlug ||
      !Number.isInteger(priceCents) ||
      priceCents < 1
    ) {
      return { fulfilled: false, reason: "invalid_checkout" };
    }

    const result = await fulfillCoursePurchase({
      userId,
      courseId,
      priceCents,
      stripeSessionId: session.id,
    });

    return {
      fulfilled: true,
      checkoutType: "course",
      alreadyFulfilled: result.alreadyFulfilled,
      courseSlug,
    };
  }

  if (checkoutType === "credits") {
    const creditAmount = Number(session.metadata?.credit_amount);
    const priceCents = Number(session.metadata?.price_cents);

    if (
      !Number.isInteger(creditAmount) ||
      creditAmount < 1 ||
      !Number.isInteger(priceCents) ||
      priceCents < 1
    ) {
      return { fulfilled: false, reason: "invalid_checkout" };
    }

    const result = await fulfillCreditPurchase({
      userId,
      credits: creditAmount,
      priceCents,
      stripeSessionId: session.id,
    });

    return {
      fulfilled: true,
      checkoutType: "credits",
      alreadyFulfilled: result.alreadyFulfilled,
      creditsGranted: result.creditsGranted,
    };
  }

  const pricingPlanId = session.metadata?.pricing_plan_id;
  if (!pricingPlanId || !isPricingPlanId(pricingPlanId)) {
    return { fulfilled: false, reason: "invalid_checkout" };
  }

  const result = await fulfillPlanPurchase({
    userId,
    pricingPlanId: pricingPlanId as PricingPlanId,
    stripeSessionId: session.id,
  });

  return {
    fulfilled: true,
    checkoutType: "plan",
    alreadyFulfilled: result.alreadyFulfilled,
    planId: pricingPlanId,
    creditsGranted:
      "creditsGranted" in result ? result.creditsGranted : undefined,
  };
}
