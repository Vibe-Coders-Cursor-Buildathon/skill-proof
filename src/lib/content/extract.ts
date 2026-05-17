import { fetchArticleContent } from "@/lib/content/article";
import { transcribeAudioFromFile, transcribeAudioFromUrl } from "@/lib/content/audio";
import { ContentExtractionError } from "@/lib/content/errors";
import { extractPdfFromFile } from "@/lib/content/pdf";
import type { SourceType } from "@/types/course";
import type { ContentExtractionResult } from "@/types/content";

export type ExtractContentParams = {
  sourceType: SourceType;
  url?: string;
  file?: File;
  language: string;
};

/**
 * Extract plain text from any supported source (used by POST /api/courses/generate).
 *
 * NOTE: YouTube is intentionally NOT handled here. The generate route sends
 * YouTube URLs directly to Gemini via fileData, so this function is never
 * called for sourceType === "youtube". Calling it that way is a programmer
 * error and throws.
 */
export async function extractContentForSource(
  params: ExtractContentParams,
): Promise<ContentExtractionResult> {
  const { sourceType, url, file } = params;

  switch (sourceType) {
    case "youtube": {
      throw new ContentExtractionError(
        "YouTube is handled directly by the generate route via Gemini fileData.",
      );
    }
    case "article": {
      if (!url) {
        throw new ContentExtractionError("Article URL is required.");
      }
      return fetchArticleContent(url);
    }
    case "pdf": {
      if (!file) {
        throw new ContentExtractionError("PDF file is required.");
      }
      return extractPdfFromFile(file);
    }
    case "audio": {
      if (file) {
        return transcribeAudioFromFile(file);
      }
      if (url) {
        return transcribeAudioFromUrl(url);
      }
      throw new ContentExtractionError(
        "Provide an audio file or a direct link to an audio file.",
      );
    }
    default: {
      const _exhaustive: never = sourceType;
      throw new ContentExtractionError(`Unsupported source type: ${_exhaustive}`);
    }
  }
}
