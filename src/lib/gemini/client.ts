import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerEnv } from "@/config/env";
import { courseContentResponseSchema } from "@/lib/gemini/course-response-schema";

let client: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!client) {
    const { GEMINI_API_KEY } = getServerEnv();
    client = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return client;
}

export function getGeminiModel(modelId = "gemini-2.5-flash") {
  return getGeminiClient().getGenerativeModel({ model: modelId });
}

/** Model configured for strict JSON course generation. */
export function getCourseGenerationModel(modelId = "gemini-2.5-flash") {
  return getGeminiClient().getGenerativeModel({
    model: modelId,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: courseContentResponseSchema,
      temperature: 0.4,
    },
  });
}
