import { buildPreview, countWords } from "@/types/content";
import type { ContentExtractionResult } from "@/types/content";
import { MIN_EXTRACTED_CHARS } from "@/lib/content/constants";
import { ContentExtractionError } from "@/lib/content/errors";

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function toExtractionResult(
  raw: string,
  sourceRef?: string,
): ContentExtractionResult {
  const content = normalizeWhitespace(raw);
  if (content.length < MIN_EXTRACTED_CHARS) {
    throw new ContentExtractionError(
      "Could not extract enough text from this source. Try a different link or file.",
    );
  }
  return {
    content,
    wordCount: countWords(content),
    sourceRef,
    preview: buildPreview(content),
  };
}
