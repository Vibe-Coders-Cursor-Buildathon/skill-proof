import { getCourseGenerationModel } from "@/lib/gemini/client";
import { parseJsonFromModel } from "@/lib/gemini/parse-json";
import type { CourseContent } from "@/types/course";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English", es: "Spanish", fr: "French", de: "German",
  pt: "Portuguese", it: "Italian", zh: "Chinese", ja: "Japanese",
  ko: "Korean", hi: "Hindi", ar: "Arabic",
};

export async function generateCourseFromContent(params: {
  content: string;
  language: string;
  difficulty: string;
  sourceType: "youtube" | "pdf" | "article" | "audio";
}): Promise<CourseContent> {
  const model = getCourseGenerationModel("gemini-2.5-flash");
  const langName = LANGUAGE_NAMES[params.language] ?? params.language;

  const prompt = `You are an expert educator. Given the following content, generate a structured micro-course as JSON.

Rules:
- concepts: 5 to 8 items
- flashcards: exactly 10 items
- quiz: exactly 5 items; each quiz item has exactly 4 options; "correct" is the 0-based index of the right option; each quiz item must include "concept" set to the exact title of the concept it tests
- Language: ${langName}
- Difficulty level: ${params.difficulty}
- Write all text in ${langName}
- title: max 60 characters, clear and engaging
- summary: exactly 3 sentences

Content to process:
${params.content.slice(0, 60000)}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseJsonFromModel<CourseContent>(text);
}
