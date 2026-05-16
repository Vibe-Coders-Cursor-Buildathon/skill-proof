import { fetchArticleContent } from "@/lib/content/article";
import { transcribeAudioFromFile, transcribeAudioFromUrl } from "@/lib/content/audio";
import { ContentExtractionError } from "@/lib/content/errors";
import { extractPdfFromFile } from "@/lib/content/pdf";
import { fetchYouTubeTranscript } from "@/lib/content/youtube";
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
 */
export async function extractContentForSource(
  params: ExtractContentParams,
): Promise<ContentExtractionResult> {
  const { sourceType, url, file, language } = params;

  switch (sourceType) {
    case "youtube": {
      if (!url) {
        throw new ContentExtractionError("YouTube URL is required.");
      }
      const result = await fetchYouTubeTranscript(url, { language });
      return {
        content: result.transcript,
        wordCount: result.wordCount,
        sourceRef: url,
        preview:
          result.transcript.length > 280
            ? `${result.transcript.slice(0, 280).trim()}…`
            : result.transcript,
      };
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
