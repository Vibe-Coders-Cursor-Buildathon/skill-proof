import { adaptiveQuizResponseSchema } from "@/lib/gemini/adaptive-quiz-schema";
import { getGeminiClient } from "@/lib/gemini/client";
import { parseJsonFromModel } from "@/lib/gemini/parse-json";
import {
  buildAdaptiveQuizPrompt,
  type AdaptiveQuizMode,
} from "@/lib/prompts/adaptive-quiz";
import { adaptiveQuizResponseSchema as zodAdaptiveSchema } from "@/types/quiz";
import type { Concept, QuizQuestion } from "@/types/course";

export async function generateAdaptiveQuiz(params: {
  mode: AdaptiveQuizMode;
  score: number;
  wrongConcepts: string[];
  concepts: Concept[];
  courseTitle: string;
  courseSummary: string;
  language: string;
  difficulty: string;
  missedQuestions?: { question: string; explanation: string; concept?: string }[];
}): Promise<QuizQuestion[]> {
  const model = getGeminiClient().getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: adaptiveQuizResponseSchema,
      temperature: params.mode === "remedial" ? 0.35 : 0.55,
    },
  });

  const prompt = buildAdaptiveQuizPrompt(params);
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const raw = parseJsonFromModel<{ questions: QuizQuestion[] }>(text);
  const validated = zodAdaptiveSchema.parse(raw);
  return validated.questions;
}
