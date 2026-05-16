import { z } from "zod";
import { quizQuestionSchema } from "@/types/course";

export const adaptiveQuizRequestSchema = z.object({
  score: z.number().min(0).max(100),
  wrongConcepts: z.array(z.string()),
  language: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "expert"]).optional(),
});

export type AdaptiveQuizRequest = z.infer<typeof adaptiveQuizRequestSchema>;

export const adaptiveQuizResponseSchema = z.object({
  questions: z.array(quizQuestionSchema).min(1).max(5),
});

export type AdaptiveQuizResponse = z.infer<typeof adaptiveQuizResponseSchema>;

export const knowledgeGapSchema = z.object({
  weakAreas: z.array(
    z.object({
      concept: z.string(),
      miniLesson: z.string(),
    }),
  ),
});

export type KnowledgeGapReport = z.infer<typeof knowledgeGapSchema>;
