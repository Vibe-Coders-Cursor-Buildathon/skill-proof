import { getGeminiModel } from "@/lib/gemini/client";
import { parseJsonFromModel } from "@/lib/gemini/parse-json";

/**
 * Step 2 of the pipeline — turn extracted content into course JSON.
 *
 * Called from POST /api/courses/generate after:
 * 1. YouTube → POST /api/content/youtube → transcript string
 * 2. PDF → Gemini Files API (see lib/gemini/files.ts)
 * 3. Article → scrape HTML, pass text here
 *
 * Wire this in src/app/api/courses/generate/route.ts when ready.
 */
export async function generateCourseFromContent(params: {
  content: string;
  language: string;
  difficulty: string;
  sourceType: "youtube" | "pdf" | "article";
}) {
  const model = getGeminiModel("gemini-2.0-flash");

  const prompt = `You are an expert educator. Given the following content, generate a structured micro-course.
Return ONLY valid JSON with this exact structure:
{
  "title": "string",
  "summary": "string (3 sentences)",
  "concepts": [{ "title": "string", "explanation": "string" }],
  "flashcards": [{ "question": "string", "answer": "string" }],
  "quiz": [{ "question": "string", "options": ["A","B","C","D"], "correct": 0, "explanation": "string" }]
}
Language: ${params.language}
Difficulty: ${params.difficulty}
Content:
${params.content}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseJsonFromModel(text);
}
