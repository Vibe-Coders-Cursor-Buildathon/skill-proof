import type { PricingPlanId } from "@/config/pricing";
import { getPricingPlan } from "@/config/pricing";
import { isPaidPricingPlanId } from "@/config/stripe-plans";
import { getStripe } from "@/lib/stripe/server";

type CreateCheckoutSessionParams = {
  userId: string;
  userEmail: string;
  pricingPlanId: PricingPlanId;
  origin: string;
};

export async function createStripeCheckoutSession({
  userId,
  userEmail,
  pricingPlanId,
  origin,
}: CreateCheckoutSessionParams) {
  if (!isPaidPricingPlanId(pricingPlanId)) {
    throw new Error("Free plan does not require payment");
  }

  const plan = getPricingPlan(pricingPlanId);
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: userEmail,
    client_reference_id: userId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: plan.priceCents,
          recurring: { interval: "month" },
          product_data: {
            name: `SkillProof ${plan.name}`,
            description: plan.tagline,
            metadata: {
              pricing_plan_id: pricingPlanId,
            },
          },
        },
      },
    ],
    metadata: {
      user_id: userId,
      pricing_plan_id: pricingPlanId,
    },
    subscription_data: {
      metadata: {
        user_id: userId,
        pricing_plan_id: pricingPlanId,
      },
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?plan=${pricingPlanId}&canceled=1`,
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return session;
}
