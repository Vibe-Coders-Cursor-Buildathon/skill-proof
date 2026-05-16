import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/errors";
import { transcribeAudioFromFile, transcribeAudioFromUrl } from "@/lib/content/audio";
import { isContentExtractionError } from "@/lib/content/errors";
import { audioContentRequestSchema } from "@/types/audio";

/**
 * Transcribe audio from a direct URL or uploaded file (Gemini extraction only).
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const fileRaw = form.get("file");

      if (!(fileRaw instanceof File) || fileRaw.size === 0) {
        return NextResponse.json(
          { error: "Audio file is required." },
          { status: 400 },
        );
      }

      const result = await transcribeAudioFromFile(fileRaw);

      return NextResponse.json({
        transcript: result.content,
        wordCount: result.wordCount,
        preview: result.preview,
        sourceRef: result.sourceRef,
      });
    }

    const body = await request.json();
    const parsed = audioContentRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await transcribeAudioFromUrl(parsed.data.url);

    return NextResponse.json({
      transcript: result.content,
      wordCount: result.wordCount,
      preview: result.preview,
      sourceRef: result.sourceRef,
    });
  } catch (error) {
    if (isContentExtractionError(error)) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    return handleApiError(error);
  }
}
