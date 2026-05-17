const PREFIX = "skillproof:course-progress:";

type StoredProgress = {
  masteredConcepts: number[];
  knownFlashcards: number[];
};

export function loadCourseProgress(slug: string): StoredProgress {
  if (typeof window === "undefined") {
    return { masteredConcepts: [], knownFlashcards: [] };
  }
  try {
    const raw = localStorage.getItem(`${PREFIX}${slug}`);
    if (!raw) return { masteredConcepts: [], knownFlashcards: [] };
    const parsed = JSON.parse(raw) as StoredProgress;
    return {
      masteredConcepts: Array.isArray(parsed.masteredConcepts)
        ? parsed.masteredConcepts
        : [],
      knownFlashcards: Array.isArray(parsed.knownFlashcards)
        ? parsed.knownFlashcards
        : [],
    };
  } catch {
    return { masteredConcepts: [], knownFlashcards: [] };
  }
}

export function saveCourseProgress(slug: string, data: StoredProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${PREFIX}${slug}`, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}
