import { z } from "zod";

export const youtubeTranscriptRequestSchema = z.object({
  url: z.string().url("A valid YouTube URL is required."),
  language: z.string().min(2).max(10).optional(),
});

export type YouTubeTranscriptRequest = z.infer<typeof youtubeTranscriptRequestSchema>;

export type YouTubeTranscriptResponse = {
  videoId: string;
  language: string;
  transcript: string;
  wordCount: number;
  preview: string;
};
