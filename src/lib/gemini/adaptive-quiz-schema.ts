import { SchemaType, type ResponseSchema } from "@google/generative-ai";

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
  required: ["question", "options", "correct", "explanation"],
};

export const adaptiveQuizResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    questions: {
      type: SchemaType.ARRAY,
      items: quizItemSchema,
      minItems: 3,
      maxItems: 3,
    },
  },
  required: ["questions"],
};
