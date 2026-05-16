import { knowledgeGapResponseSchema } from "@/lib/gemini/knowledge-gap-schema";
import { getGeminiClient } from "@/lib/gemini/client";
import { parseJsonFromModel } from "@/lib/gemini/parse-json";
import { buildKnowledgeGapPrompt } from "@/lib/prompts/knowledge-gap";
import { knowledgeGapSchema, type KnowledgeGapReport } from "@/types/quiz";
import type { Concept } from "@/types/course";

export async function generateKnowledgeGapReport(params: {
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
}): Promise<KnowledgeGapReport> {
  if (params.wrongConcepts.length === 0) {
    return { weakAreas: [] };
  }

  const model = getGeminiClient().getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: knowledgeGapResponseSchema,
      temperature: 0.4,
    },
  });

  const prompt = buildKnowledgeGapPrompt(params);
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const raw = parseJsonFromModel<KnowledgeGapReport>(text);
  return knowledgeGapSchema.parse(raw);
}
