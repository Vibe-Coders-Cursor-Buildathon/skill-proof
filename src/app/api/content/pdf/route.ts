import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/errors";
import { isContentExtractionError } from "@/lib/content/errors";
import { extractPdfFromFile } from "@/lib/content/pdf";

/**
 * Extract plain text from an uploaded PDF (no Gemini).
 */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const fileRaw = form.get("file");

    if (!(fileRaw instanceof File) || fileRaw.size === 0) {
      return NextResponse.json(
        { error: "PDF file is required." },
        { status: 400 },
      );
    }

    const result = await extractPdfFromFile(fileRaw);

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
