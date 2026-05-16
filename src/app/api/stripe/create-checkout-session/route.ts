import { NextResponse } from "next/server";
import { z } from "zod";

import { isPricingPlanId } from "@/config/pricing";
import { isPaidPricingPlanId } from "@/config/stripe-plans";
import { handleApiError, unauthorized } from "@/lib/api/errors";
import { getUser } from "@/lib/auth/session";
import { createStripeCheckoutSession } from "@/lib/stripe/create-checkout-session";
import { isStripeConfigured } from "@/lib/stripe/server";

const bodySchema = z.object({
  planId: z.string(),
});

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

    const { planId } = parsed.data;
    if (!isPricingPlanId(planId) || !isPaidPricingPlanId(planId)) {
      return NextResponse.json(
        { error: "Invalid or unpaid plan" },
        { status: 400 },
      );
    }

    const origin = new URL(request.url).origin;
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
