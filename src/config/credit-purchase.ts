/** Minimum credits per purchase */
export const MIN_CREDIT_PURCHASE = 5;

/** Standard rate: $1 per credit (in cents) */
export const CREDIT_UNIT_PRICE_CENTS = 100;

/** Discounted bundles (exact credit amounts only) */
export const CREDIT_BUNDLES = [
  { credits: 10, priceCents: 900, label: "10 credits" },
  { credits: 50, priceCents: 4800, label: "50 credits" },
  { credits: 100, priceCents: 9500, label: "100 credits" },
] as const;

export type CreditPurchaseQuote = {
  credits: number;
  priceCents: number;
  /** Display price per credit in cents */
  effectiveUnitCents: number;
  isBundle: boolean;
  savingsCents: number;
};

export function isValidCreditPurchaseAmount(credits: number): boolean {
  return (
    Number.isInteger(credits) &&
    credits >= MIN_CREDIT_PURCHASE &&
    credits <= 10_000
  );
}

export function getCreditPurchaseQuote(credits: number): CreditPurchaseQuote {
  if (!isValidCreditPurchaseAmount(credits)) {
    throw new Error(
      `Invalid credit amount. Minimum is ${MIN_CREDIT_PURCHASE} credits.`,
    );
  }

  const bundle = CREDIT_BUNDLES.find((b) => b.credits === credits);
  const standardPrice = credits * CREDIT_UNIT_PRICE_CENTS;

  if (bundle) {
    return {
      credits,
      priceCents: bundle.priceCents,
      effectiveUnitCents: Math.round(bundle.priceCents / credits),
      isBundle: true,
      savingsCents: standardPrice - bundle.priceCents,
    };
  }

  return {
    credits,
    priceCents: standardPrice,
    effectiveUnitCents: CREDIT_UNIT_PRICE_CENTS,
    isBundle: false,
    savingsCents: 0,
  };
}

export function getCreditsCheckoutPath(credits: number): string {
  return `/checkout?type=credits&credits=${credits}`;
}
