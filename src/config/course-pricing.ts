/** Free preview limits for paid public courses */
export const PREVIEW_CONCEPT_COUNT = 1;
export const PREVIEW_FLASHCARD_COUNT = 1;
export const PREVIEW_QUIZ_COUNT = 1;

/** Publisher list price bounds (USD cents) */
export const MIN_COURSE_PRICE_CENTS = 99;
export const MAX_COURSE_PRICE_CENTS = 99900;

export function isValidCoursePriceCents(cents: number): boolean {
  return (
    Number.isInteger(cents) &&
    cents >= MIN_COURSE_PRICE_CENTS &&
    cents <= MAX_COURSE_PRICE_CENTS
  );
}

export function parsePriceDollarsToCents(dollars: number): number | null {
  if (!Number.isFinite(dollars) || dollars <= 0) return null;
  const cents = Math.round(dollars * 100);
  return isValidCoursePriceCents(cents) ? cents : null;
}

export function isPaidPublicCourse(priceCents: number | null | undefined): boolean {
  return typeof priceCents === "number" && priceCents >= MIN_COURSE_PRICE_CENTS;
}
