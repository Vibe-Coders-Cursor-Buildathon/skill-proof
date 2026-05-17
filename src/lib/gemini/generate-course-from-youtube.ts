import { getCourseGenerationModel } from "@/lib/gemini/client";
import { getLanguageName } from "@/lib/gemini/languages";
import { parseJsonFromModel } from "@/lib/gemini/parse-json";
import type { CourseContent } from "@/types/course";

/**
 * Generate a structured course directly from a YouTube URL.
 *
 * Uses Gemini 2.5 Flash's native `fileData` input — Google fetches the video,
 * so we avoid YouTube's IP-based blocks on Vercel datacenter ranges. This
 * replaces the previous transcript-scraping path for the youtube source type.
 */
export async function generateCourseFromYouTubeVideo(params: {
  url: string;
  language: string;
  difficulty: string;
}): Promise<CourseContent> {
  const model = getCourseGenerationModel("gemini-2.5-flash");
  const langName = getLanguageName(params.language);

  const prompt = `You are an expert educator. Watch the linked YouTube video end-to-end and generate a structured micro-course as JSON based on its content.

Rules:
- concepts: 5 to 8 items
- flashcards: exactly 10 items
- quiz: exactly 5 items; each quiz item has exactly 4 options; "correct" is the 0-based index of the right option; each quiz item must include "concept" set to the exact title of the concept it tests
- Language: ${langName}
- Difficulty level: ${params.difficulty}
- Write all text in ${langName}
- title: max 60 characters, clear and engaging
- summary: exactly 3 sentences
- Base the course only on what is actually shown or said in the video. Do not invent material.`;

  const result = await model.generateContent([
    {
      fileData: {
        fileUri: params.url,
        mimeType: "video/*",
      },
    },
    { text: prompt },
  ]);

  const text = result.response.text();
  return parseJsonFromModel<CourseContent>(text);
}
