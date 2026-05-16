import type { Concept } from "@/types/course";

export function buildKnowledgeGapPrompt(params: {
  wrongConcepts: string[];
  courseTitle: string;
  courseSummary: string;
  concepts: Concept[];
  score: number;
  missedQuestions: {
    question: string;
    explanation: string;
    concept?: string;
  }[];
  language: string;
  difficulty: string;
}): string {
  const {
    wrongConcepts,
    courseTitle,
    courseSummary,
    concepts,
    score,
    missedQuestions,
    language,
    difficulty,
  } = params;

  const conceptBlock = concepts
    .map(
      (c) =>
        `- ${c.title}: ${c.explanation.slice(0, 400)}${c.explanation.length > 400 ? "…" : ""}`,
    )
    .join("\n");

  const missedBlock = missedQuestions
    .map(
      (m, i) =>
        `${i + 1}. Concept: ${m.concept ?? "Unknown"}\n   Question: ${m.question}\n   Why it matters: ${m.explanation}`,
    )
    .join("\n\n");

  return `You are an expert tutor. The learner finished a quiz on "${courseTitle}" with ${score}%.

Course summary: ${courseSummary}

All course concepts:
${conceptBlock}

They answered incorrectly on these concepts: ${wrongConcepts.join(", ")}

Missed quiz items:
${missedBlock}

Generate a targeted re-study mini-lesson for EACH missed concept only (skip concepts they likely understood).

Return JSON:
{
  "weakAreas": [
    {
      "concept": "exact concept title from the course",
      "miniLesson": "2-3 short paragraphs in plain language re-teaching the concept. Use simple examples. Write in ${language}.",
      "keyTakeaways": ["bullet 1", "bullet 2", "bullet 3"]
    }
  ]
}

Rules:
- Only include concepts from the missed list
- Difficulty level: ${difficulty}
- Be encouraging, not judgmental
- miniLesson: 120-220 words per concept
- keyTakeaways: 2-4 memorable one-line facts`;
}
