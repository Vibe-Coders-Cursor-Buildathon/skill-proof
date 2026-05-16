import { z } from "zod";
import {
  courseContentSchema,
  difficultySchema,
  sourceTypeSchema,
} from "@/types/course";

export const generateCourseRequestSchema = z.object({
  sourceType: sourceTypeSchema,
  url: z.string().url().optional(),
  language: z.string().default("en"),
  difficulty: difficultySchema.default("beginner"),
});

export type GenerateCourseRequest = z.infer<typeof generateCourseRequestSchema>;

export const generateCourseResponseSchema = z.object({
  slug: z.string(),
  course: courseContentSchema,
  creditsBalance: z.number().optional(),
});

export type GenerateCourseResponse = z.infer<typeof generateCourseResponseSchema>;

export const coachMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const coachRequestSchema = z.object({
  slug: z.string(),
  messages: z.array(coachMessageSchema).min(1),
});

export type CoachRequest = z.infer<typeof coachRequestSchema>;

export const coachResponseSchema = z.object({
  message: z.string(),
});

export type CoachResponse = z.infer<typeof coachResponseSchema>;

export const saveCourseRequestSchema = z.object({
  slug: z.string(),
  title: z.string(),
  sourceType: sourceTypeSchema,
  sourceRef: z.string().optional(),
  language: z.string(),
  difficulty: difficultySchema,
  content: courseContentSchema,
});

export type SaveCourseRequest = z.infer<typeof saveCourseRequestSchema>;
