export const CERTIFICATE_MIN_COURSE_PROGRESS_PERCENT = 80;

type CourseProgressInput = {
  masteredConcepts: number;
  totalConcepts: number;
  knownFlashcards: number;
  totalFlashcards: number;
  /** When true, counts as 100% quiz leg in the average (for certificate progress). */
  quizPassed?: boolean;
};

/** Average of learn, flashcards, and optional quiz completion. */
export function computeCourseProgressPercent({
  masteredConcepts,
  totalConcepts,
  knownFlashcards,
  totalFlashcards,
  quizPassed,
}: CourseProgressInput): number {
  const learn =
    totalConcepts > 0
      ? Math.round((masteredConcepts / totalConcepts) * 100)
      : null;
  const flash =
    totalFlashcards > 0
      ? Math.round((knownFlashcards / totalFlashcards) * 100)
      : null;
  const quiz = quizPassed === true ? 100 : quizPassed === false ? 0 : null;

  const parts = [learn, flash, quiz].filter((p): p is number => p !== null);
  if (parts.length === 0) return 0;
  return Math.round(parts.reduce((sum, p) => sum + p, 0) / parts.length);
}

export function meetsCertificateCourseProgress(progressPercent: number): boolean {
  return progressPercent > CERTIFICATE_MIN_COURSE_PROGRESS_PERCENT;
}
