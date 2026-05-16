import type { Difficulty } from "@/types/course";

export function buildCourseGenerationPrompt(params: {
  content: string;
  language: string;
  difficulty: Difficulty;
}): string {
  const { content, language, difficulty } = params;

  return `You are an expert educator. Given the following content, generate a structured micro-course.
Return ONLY valid JSON with this exact structure:
{
  "title": "string",
  "summary": "string (3 sentences)",
  "concepts": [{ "title": "string", "explanation": "string" }],
  "flashcards": [{ "question": "string", "answer": "string" }],
  "quiz": [{
    "question": "string",
    "options": ["A","B","C","D"],
    "correct": 0,
    "explanation": "string"
  }]
}

Language: ${language}
Difficulty: ${difficulty}

Content:
${content}`;
}
