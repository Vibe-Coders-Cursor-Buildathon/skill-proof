import { z } from "zod";

export const conceptSchema = z.object({
  title: z.string(),
  explanation: z.string(),
});

export const flashcardSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const quizQuestionSchema = z.object({
  question: z.string(),
  options: z.tuple([
    z.string(),
    z.string(),
    z.string(),
    z.string(),
  ]),
  correct: z.number().int().min(0).max(3),
  explanation: z.string(),
});

export const courseContentSchema = z.object({
  title: z.string(),
  summary: z.string(),
  concepts: z.array(conceptSchema).min(5).max(8),
  flashcards: z.array(flashcardSchema).length(10),
  quiz: z.array(quizQuestionSchema).length(5),
});

export type Concept = z.infer<typeof conceptSchema>;
export type Flashcard = z.infer<typeof flashcardSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type CourseContent = z.infer<typeof courseContentSchema>;

export const sourceTypeSchema = z.enum(["youtube", "pdf", "article", "audio"]);
export type SourceType = z.infer<typeof sourceTypeSchema>;

export const difficultySchema = z.enum(["beginner", "intermediate", "expert"]);
export type Difficulty = z.infer<typeof difficultySchema>;

export const courseRecordSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  source_type: sourceTypeSchema,
  source_ref: z.string().nullable(),
  language: z.string(),
  difficulty: difficultySchema,
  content: courseContentSchema,
  created_at: z.string(),
});

export type CourseRecord = z.infer<typeof courseRecordSchema>;
