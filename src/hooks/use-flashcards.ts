/**
 * Flashcard navigation hook — implementation pending Phase 1 (P1).
 */
export function useFlashcards(total: number) {
  void total;
  return {
    currentIndex: 0,
    isFlipped: false,
    goNext: () => {},
    goPrev: () => {},
    flip: () => {},
  };
}
