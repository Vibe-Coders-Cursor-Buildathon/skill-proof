import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/errors";
import { extractYouTubeVideoId, fetchYouTubeTranscript } from "@/lib/content/youtube";
import { youtubeTranscriptRequestSchema } from "@/types/youtube";

/**
 * Step 1 of the pipeline: extract transcript from a YouTube URL.
 *
 * Gemini is NOT used here — captions come from YouTube directly (fast + free).
 * Your Gemini API key is used in POST /api/courses/generate to turn the
 * transcript into structured course JSON (see src/lib/gemini/).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = youtubeTranscriptRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { url, language } = parsed.data;
    const videoId = extractYouTubeVideoId(url);

    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL. Use youtube.com/watch?v=... or youtu.be/..." },
        { status: 400 },
      );
    }

    const result = await fetchYouTubeTranscript(url, { language });
    const preview =
      result.transcript.length > 280
        ? `${result.transcript.slice(0, 280).trim()}…`
        : result.transcript;

    return NextResponse.json({
      videoId: result.videoId,
      language: result.language,
      transcript: result.transcript,
      wordCount: result.wordCount,
      preview,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to extract transcript";

    if (
      message.includes("No captions") ||
      message.includes("Caption file was empty") ||
      message.includes("Invalid YouTube")
    ) {
      return NextResponse.json({ error: message }, { status: 422 });
    }

    return handleApiError(error);
  }
}
