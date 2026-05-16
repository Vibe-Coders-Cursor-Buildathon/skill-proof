import { SchemaType, type ResponseSchema } from "@google/generative-ai";

const weakAreaItemSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    concept: { type: SchemaType.STRING },
    miniLesson: { type: SchemaType.STRING },
    keyTakeaways: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      minItems: 2,
      maxItems: 4,
    },
  },
  required: ["concept", "miniLesson", "keyTakeaways"],
};

export const knowledgeGapResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    weakAreas: {
      type: SchemaType.ARRAY,
      items: weakAreaItemSchema,
      minItems: 1,
      maxItems: 6,
    },
  },
  required: ["weakAreas"],
};
