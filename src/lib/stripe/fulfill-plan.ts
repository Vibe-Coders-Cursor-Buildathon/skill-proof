import { getPricingPlan, type PricingPlanId } from "@/config/pricing";
import { getDbPlanSlug, isPaidPricingPlanId } from "@/config/stripe-plans";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function hasFulfilledStripeSession(
  userId: string,
  stripeSessionId: string,
): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from("credit_transactions")
    .select("id")
    .eq("user_id", userId)
    .eq("reason", "plan_purchase")
    .contains("metadata", { stripe_session_id: stripeSessionId })
    .maybeSingle();

  return Boolean(data);
}

/**
 * Applies plan + credits after Stripe Checkout completes (idempotent per session).
 */
export async function fulfillPlanPurchase({
  userId,
  pricingPlanId,
  stripeSessionId,
}: {
  userId: string;
  pricingPlanId: PricingPlanId;
  stripeSessionId: string;
}) {
  if (!isPaidPricingPlanId(pricingPlanId)) {
    throw new Error("Cannot fulfill free plan via Stripe");
  }

  if (await hasFulfilledStripeSession(userId, stripeSessionId)) {
    return { alreadyFulfilled: true as const };
  }

  const pricingPlan = getPricingPlan(pricingPlanId);
  const dbSlug = getDbPlanSlug(pricingPlanId);
  const admin = getSupabaseAdminClient();

  const { data: dbPlan, error: planError } = await admin
    .from("plans")
    .select("id")
    .eq("slug", dbSlug)
    .eq("is_active", true)
    .single();

  if (planError || !dbPlan) {
    throw new Error(`Database plan not found for slug: ${dbSlug}`);
  }

  const renewsAt = new Date();
  renewsAt.setMonth(renewsAt.getMonth() + 1);

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      plan_id: dbPlan.id,
      plan_renews_at: renewsAt.toISOString(),
    })
    .eq("id", userId);

  if (profileError) {
    throw profileError;
  }

  const { error: grantError } = await admin.rpc("grant_credits", {
    p_user_id: userId,
    p_amount: pricingPlan.credits,
    p_reason: "plan_purchase",
    p_reference_id: null,
    p_metadata: {
      pricing_plan_id: pricingPlanId,
      db_plan_slug: dbSlug,
      stripe_session_id: stripeSessionId,
    },
  });

  if (grantError) {
    throw grantError;
  }

  return { alreadyFulfilled: false as const, creditsGranted: pricingPlan.credits };
}
