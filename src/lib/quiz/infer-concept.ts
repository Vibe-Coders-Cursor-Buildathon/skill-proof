import type { Concept, QuizQuestion } from "@/types/course";

/** Resolves which course concept a quiz question targets. */
export function inferConceptForQuestion(
  question: QuizQuestion,
  concepts: Concept[],
): string {
  if (question.concept?.trim()) {
    return question.concept.trim();
  }

  const haystack =
    `${question.question} ${question.explanation}`.toLowerCase();

  for (const concept of concepts) {
    const title = concept.title.toLowerCase();
    if (title.length > 2 && haystack.includes(title)) {
      return concept.title;
    }
  }

  return concepts[0]?.title ?? "Course material";
}

export function collectWrongConcepts(
  questions: QuizQuestion[],
  answers: { index: number; selected: number }[],
  concepts: Concept[],
): string[] {
  const wrong = new Set<string>();

  for (const { index, selected } of answers) {
    const q = questions[index];
    if (!q || selected === q.correct) continue;
    wrong.add(inferConceptForQuestion(q, concepts));
  }

  return [...wrong];
}

export function buildMissedQuestions(
  questions: QuizQuestion[],
  answers: { index: number; selected: number }[],
  concepts: Concept[],
) {
  return answers
    .filter((a) => questions[a.index]?.correct !== a.selected)
    .map((a) => {
      const q = questions[a.index];
      return {
        question: q.question,
        explanation: q.explanation,
        concept: inferConceptForQuestion(q, concepts),
      };
    });
}
