import { NextResponse } from "next/server";
import type Stripe from "stripe";

import type { PricingPlanId } from "@/config/pricing";
import { isPricingPlanId } from "@/config/pricing";
import { fulfillCreditPurchase } from "@/lib/stripe/fulfill-credits";
import { fulfillPlanPurchase } from "@/lib/stripe/fulfill-plan";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("[stripe webhook]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    }
  } catch (error) {
    console.error("[stripe webhook] handler error", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.status !== "complete") {
    return;
  }

  const userId =
    session.metadata?.user_id ?? session.client_reference_id ?? null;

  if (!userId) {
    console.error("[stripe webhook] missing user_id", { sessionId: session.id });
    return;
  }

  const checkoutType = session.metadata?.checkout_type ?? "plan";

  if (checkoutType === "credits") {
    const creditAmount = Number(session.metadata?.credit_amount);
    const priceCents = Number(session.metadata?.price_cents);
    if (
      !Number.isInteger(creditAmount) ||
      creditAmount < 1 ||
      !Number.isInteger(priceCents)
    ) {
      console.error("[stripe webhook] invalid credits metadata", session.id);
      return;
    }
    await fulfillCreditPurchase({
      userId,
      credits: creditAmount,
      priceCents,
      stripeSessionId: session.id,
    });
    return;
  }

  const pricingPlanId = session.metadata?.pricing_plan_id;
  if (!pricingPlanId || !isPricingPlanId(pricingPlanId)) {
    console.error("[stripe webhook] missing plan metadata", {
      userId,
      pricingPlanId,
      sessionId: session.id,
    });
    return;
  }

  await fulfillPlanPurchase({
    userId,
    pricingPlanId: pricingPlanId as PricingPlanId,
    stripeSessionId: session.id,
  });
}
