import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/errors";
import { fetchArticleContent } from "@/lib/content/article";
import { isContentExtractionError } from "@/lib/content/errors";
import { articleContentRequestSchema } from "@/types/article";

/**
 * Extract readable text from a web article URL (no Gemini).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = articleContentRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await fetchArticleContent(parsed.data.url);

    return NextResponse.json({
      content: result.content,
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
