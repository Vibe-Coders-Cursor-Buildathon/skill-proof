import { getGeminiModel } from "@/lib/gemini/client";
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
  sourceType: "youtube" | "pdf" | "article";
}): Promise<CourseContent> {
  const model = getGeminiModel("gemini-2.5-flash");
  const langName = LANGUAGE_NAMES[params.language] ?? params.language;

  const prompt = `You are an expert educator. Given the following content, generate a structured micro-course.
Return ONLY valid JSON with this EXACT structure — no extra keys, no markdown, no explanation:
{
  "title": "A clear, engaging course title (max 60 chars)",
  "summary": "Exactly 3 sentences summarising the course.",
  "concepts": [
    { "title": "Concept title", "explanation": "Plain-language explanation (2-4 sentences)." }
  ],
  "flashcards": [
    { "question": "Question text", "answer": "Answer text" }
  ],
  "quiz": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Why this answer is correct."
    }
  ]
}

Rules:
- concepts: 5 to 8 items
- flashcards: exactly 10 items
- quiz: exactly 5 items
- Language: ${langName}
- Difficulty level: ${params.difficulty}
- Write all text in ${langName}

Content to process:
${params.content.slice(0, 60000)}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseJsonFromModel<CourseContent>(text);
}
