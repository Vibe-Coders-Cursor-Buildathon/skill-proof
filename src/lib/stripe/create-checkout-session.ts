import { getCreditPurchaseQuote } from "@/config/credit-purchase";
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

type CreateCreditsCheckoutParams = {
  userId: string;
  userEmail: string;
  credits: number;
  origin: string;
};

export async function createStripeCreditsCheckoutSession({
  userId,
  userEmail,
  credits,
  origin,
}: CreateCreditsCheckoutParams) {
  const quote = getCreditPurchaseQuote(credits);
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: userEmail,
    client_reference_id: userId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: quote.priceCents,
          product_data: {
            name: `${quote.credits} SkillProof Credits`,
            description:
              quote.savingsCents > 0
                ? `Bundle price — save $${(quote.savingsCents / 100).toFixed(2)} vs $1/credit`
                : `${quote.credits} course generation credits at $1 each`,
            metadata: {
              checkout_type: "credits",
              credit_amount: String(quote.credits),
            },
          },
        },
      },
    ],
    metadata: {
      user_id: userId,
      checkout_type: "credits",
      credit_amount: String(quote.credits),
      price_cents: String(quote.priceCents),
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=credits`,
    cancel_url: `${origin}/checkout?type=credits&credits=${quote.credits}&canceled=1`,
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return session;
}
