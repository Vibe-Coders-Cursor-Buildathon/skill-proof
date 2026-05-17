const PREFIX = "skillproof:quiz-pass:";

export function saveQuizPassForCourse(slug: string, scorePercent: number): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${PREFIX}${slug}`, String(scorePercent));
  } catch {
    /* ignore quota / private mode */
  }
}

export function getQuizPassForCourse(slug: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${slug}`);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
