import { SchemaType, type ResponseSchema } from "@google/generative-ai";

const conceptItemSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    explanation: { type: SchemaType.STRING },
  },
  required: ["title", "explanation"],
};

const flashcardItemSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    question: { type: SchemaType.STRING },
    answer: { type: SchemaType.STRING },
  },
  required: ["question", "answer"],
};

const quizItemSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    question: { type: SchemaType.STRING },
    concept: { type: SchemaType.STRING },
    options: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      minItems: 4,
      maxItems: 4,
    },
    correct: { type: SchemaType.INTEGER },
    explanation: { type: SchemaType.STRING },
  },
  required: ["question", "options", "correct", "explanation", "concept"],
};

/** Gemini responseSchema for structured course JSON output. */
export const courseContentResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    summary: { type: SchemaType.STRING },
    concepts: {
      type: SchemaType.ARRAY,
      items: conceptItemSchema,
      minItems: 5,
      maxItems: 8,
    },
    flashcards: {
      type: SchemaType.ARRAY,
      items: flashcardItemSchema,
      minItems: 10,
      maxItems: 10,
    },
    quiz: {
      type: SchemaType.ARRAY,
      items: quizItemSchema,
      minItems: 5,
      maxItems: 5,
    },
  },
  required: ["title", "summary", "concepts", "flashcards", "quiz"],
};
