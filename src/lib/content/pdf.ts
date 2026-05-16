import { PDF_MAX_BYTES } from "@/lib/content/constants";
import { ContentExtractionError } from "@/lib/content/errors";
import { toExtractionResult } from "@/lib/content/utils";
import type { ContentExtractionResult } from "@/types/content";

export function validatePdfFile(file: File): void {
  if (file.size > PDF_MAX_BYTES) {
    throw new ContentExtractionError("PDF must be under 25 MB.");
  }
  const isPdf =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    throw new ContentExtractionError("Upload a valid PDF file.");
  }
}

/**
 * Extract plain text from a PDF buffer (no Gemini).
 */
export async function extractPdfText(
  buffer: Buffer,
  sourceRef?: string,
): Promise<ContentExtractionResult> {
  if (buffer.length > PDF_MAX_BYTES) {
    throw new ContentExtractionError("PDF must be under 25 MB.");
  }

  let text: string;
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    text = result.text ?? "";
    await parser.destroy();
  } catch {
    throw new ContentExtractionError(
      "Could not extract text from this PDF. It may be scanned, encrypted, or corrupted.",
    );
  }

  if (!text.trim()) {
    throw new ContentExtractionError(
      "Could not extract text from this PDF. It may be image-only or empty.",
    );
  }

  return toExtractionResult(text, sourceRef);
}

export async function extractPdfFromFile(
  file: File,
): Promise<ContentExtractionResult> {
  validatePdfFile(file);
  const buffer = Buffer.from(await file.arrayBuffer());
  return extractPdfText(buffer, file.name);
}
