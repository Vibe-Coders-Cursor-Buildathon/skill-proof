import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getCreditPurchaseQuote,
  isValidCreditPurchaseAmount,
} from "@/config/credit-purchase";
import { isPricingPlanId } from "@/config/pricing";
import { isPaidPricingPlanId } from "@/config/stripe-plans";
import { handleApiError, unauthorized } from "@/lib/api/errors";
import { requireFeature } from "@/lib/auth/plan-guard";
import { getUser } from "@/lib/auth/session";
import {
  createStripeCheckoutSession,
  createStripeCreditsCheckoutSession,
} from "@/lib/stripe/create-checkout-session";
import { isStripeConfigured } from "@/lib/stripe/server";

const bodySchema = z.union([
  z.object({ planId: z.string() }),
  z.object({ credits: z.number().int() }),
]);

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local (test key: sk_test_…).",
        },
        { status: 503 },
      );
    }

    const user = await getUser();
    if (!user?.email) {
      return unauthorized();
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const origin = new URL(request.url).origin;

    if ("credits" in parsed.data) {
      const { credits } = parsed.data;
      if (!isValidCreditPurchaseAmount(credits)) {
        return NextResponse.json(
          { error: "Minimum purchase is 5 credits" },
          { status: 400 },
        );
      }

      await requireFeature(user.id, "can_purchase_credits");

      getCreditPurchaseQuote(credits);

      const session = await createStripeCreditsCheckoutSession({
        userId: user.id,
        userEmail: user.email,
        credits,
        origin,
      });

      return NextResponse.json({ url: session.url });
    }

    const { planId } = parsed.data;
    if (!isPricingPlanId(planId) || !isPaidPricingPlanId(planId)) {
      return NextResponse.json(
        { error: "Invalid or unpaid plan" },
        { status: 400 },
      );
    }

    const session = await createStripeCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      pricingPlanId: planId,
      origin,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return handleApiError(error);
  }
}
