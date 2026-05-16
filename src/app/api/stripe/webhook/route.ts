import { NextResponse } from "next/server";
import type Stripe from "stripe";

import type { PricingPlanId } from "@/config/pricing";
import { isPricingPlanId } from "@/config/pricing";
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
  const pricingPlanId = session.metadata?.pricing_plan_id;

  if (!userId || !pricingPlanId || !isPricingPlanId(pricingPlanId)) {
    console.error("[stripe webhook] missing metadata", {
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
