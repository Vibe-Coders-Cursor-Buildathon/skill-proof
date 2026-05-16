/**
 * Gemini Files API helpers for PDF/video uploads.
 * Implementation pending — Phase 1 (P2).
 */

export async function uploadFileToGemini(
  file: Buffer,
  mimeType: string,
  displayName: string,
): Promise<{ fileUri: string }> {
  void file;
  void mimeType;
  void displayName;
  throw new Error("uploadFileToGemini is not implemented");
}
