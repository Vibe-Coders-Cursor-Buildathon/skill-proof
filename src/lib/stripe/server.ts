import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error(
      "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local (use sk_test_… from Stripe Dashboard → Developers → API keys).",
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is missing. For local dev run: stripe listen --forward-to localhost:3000/api/stripe/webhook",
    );
  }
  return secret;
}
