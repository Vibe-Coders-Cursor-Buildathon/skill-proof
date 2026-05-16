import { z } from "zod";

export const articleContentRequestSchema = z.object({
  url: z.string().url("A valid article URL is required."),
});

export type ArticleContentRequest = z.infer<typeof articleContentRequestSchema>;

export type ArticleContentResponse = {
  content: string;
  wordCount: number;
  preview: string;
  sourceRef: string;
};
