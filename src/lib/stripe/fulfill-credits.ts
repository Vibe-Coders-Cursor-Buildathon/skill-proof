import {
  getCreditPurchaseQuote,
  isValidCreditPurchaseAmount,
} from "@/config/credit-purchase";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function hasFulfilledCreditSession(
  userId: string,
  stripeSessionId: string,
): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from("credit_transactions")
    .select("id")
    .eq("user_id", userId)
    .eq("reason", "credit_purchase")
    .contains("metadata", { stripe_session_id: stripeSessionId })
    .maybeSingle();

  return Boolean(data);
}

export async function fulfillCreditPurchase({
  userId,
  credits,
  priceCents,
  stripeSessionId,
}: {
  userId: string;
  credits: number;
  priceCents: number;
  stripeSessionId: string;
}) {
  if (!isValidCreditPurchaseAmount(credits)) {
    throw new Error("Invalid credit amount");
  }

  const quote = getCreditPurchaseQuote(credits);
  if (quote.priceCents !== priceCents) {
    throw new Error("Price does not match credit quote");
  }

  if (await hasFulfilledCreditSession(userId, stripeSessionId)) {
    return { alreadyFulfilled: true as const, creditsGranted: credits };
  }

  const admin = getSupabaseAdminClient();
  const { error: grantError } = await admin.rpc("grant_credits", {
    p_user_id: userId,
    p_amount: credits,
    p_reason: "credit_purchase",
    p_reference_id: null,
    p_metadata: {
      stripe_session_id: stripeSessionId,
      price_cents: priceCents,
      credits,
    },
  });

  if (grantError) {
    throw grantError;
  }

  return { alreadyFulfilled: false as const, creditsGranted: credits };
}
