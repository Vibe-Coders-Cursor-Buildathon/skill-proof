import { z } from "zod";

export const audioContentRequestSchema = z.object({
  url: z.string().url("A valid audio URL is required."),
});

export type AudioContentRequest = z.infer<typeof audioContentRequestSchema>;

export type AudioContentResponse = {
  transcript: string;
  wordCount: number;
  preview: string;
  sourceRef: string;
};
