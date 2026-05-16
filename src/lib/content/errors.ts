/** Thrown when content extraction fails in a user-recoverable way (maps to HTTP 422). */
export class ContentExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentExtractionError";
  }
}

export function isContentExtractionError(err: unknown): err is ContentExtractionError {
  return err instanceof ContentExtractionError;
}
