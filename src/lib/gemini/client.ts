import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerEnv } from "@/config/env";

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
