import type { Concept } from "@/types/course";

export type AdaptiveQuizMode = "remedial" | "challenge";

export function buildAdaptiveQuizPrompt(params: {
  mode: AdaptiveQuizMode;
  score: number;
  wrongConcepts: string[];
  concepts: Concept[];
  courseTitle: string;
  courseSummary: string;
  language: string;
  difficulty: string;
  missedQuestions?: { question: string; explanation: string; concept?: string }[];
}): string {
  const {
    mode,
    score,
    wrongConcepts,
    concepts,
    courseTitle,
    courseSummary,
    language,
    difficulty,
    missedQuestions,
  } = params;

  const conceptBlock = concepts
    .map(
      (c, i) =>
        `${i + 1}. ${c.title}: ${c.explanation.slice(0, 280)}${c.explanation.length > 280 ? "…" : ""}`,
    )
    .join("\n");

  const missedBlock =
    missedQuestions && missedQuestions.length > 0
      ? missedQuestions
          .map(
            (m, i) =>
              `${i + 1}. [${m.concept ?? "General"}] Q: ${m.question}\n   Why wrong: ${m.explanation}`,
          )
          .join("\n")
      : "None provided.";

  const modeInstructions =
    mode === "remedial"
      ? `The learner scored ${score}% (below 60%). Generate exactly 3 NEW, EASIER follow-up questions.
- Target ONLY these weak concepts: ${wrongConcepts.join(", ") || "areas they missed"}
- Use simpler language, shorter sentences, and more obvious distractors
- Each question must include a helpful "explanation" that teaches the concept briefly
- Set "concept" to the concept title each question tests`
      : `The learner scored ${score}% (above 85%). Generate exactly 3 NEW, HARDER challenge questions.
- Cover the full course at ${difficulty} level or slightly above
- Use edge cases, application scenarios, and "what if" situations
- Avoid repeating the exact wording of the original quiz
- Set "concept" to the primary concept each question tests`;

  return `You are an expert educator building an adaptive quiz for the micro-course "${courseTitle}".

Course summary: ${courseSummary}

Key concepts:
${conceptBlock}

Language for all text: ${language}
Course difficulty: ${difficulty}

${modeInstructions}

Questions the learner missed:
${missedBlock}

Return JSON only:
{
  "questions": [
    {
      "question": "string",
      "concept": "string (concept title)",
      "options": ["string", "string", "string", "string"],
      "correct": 0,
      "explanation": "string"
    }
  ]
}

Rules:
- Exactly 3 questions
- "correct" is 0-based index (0-3)
- Exactly 4 options per question
- All content in ${language}`;
}
