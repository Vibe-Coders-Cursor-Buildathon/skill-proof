import type { PricingPlanId } from "@/config/pricing";
import { isPricingPlanId } from "@/config/pricing";

export const PENDING_CHECKOUT_KEY = "skillproof_pending_checkout_plan";

export function getCheckoutPath(planId: PricingPlanId): string {
  return `/checkout?plan=${planId}`;
}

export function savePendingCheckout(planId: PricingPlanId) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PENDING_CHECKOUT_KEY, planId);
  } catch {
    // ignore
  }
}

export function loadPendingCheckout(): PricingPlanId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw || !isPricingPlanId(raw)) return null;
    return raw;
  } catch {
    return null;
  }
}

export function clearPendingCheckout() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
  } catch {
    // ignore
  }
}

/** OAuth / email callback redirect target when a plan was selected before sign-in. */
export function getPendingCheckoutRedirect(): string | null {
  const planId = loadPendingCheckout();
  if (!planId) return null;
  return getCheckoutPath(planId);
}
