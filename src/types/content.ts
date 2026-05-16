/** Result of extracting plain text from any content source. */
export type ContentExtractionResult = {
  content: string;
  wordCount: number;
  sourceRef?: string;
  preview?: string;
};

export function buildPreview(content: string, maxLen = 280): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen).trim()}…`;
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
