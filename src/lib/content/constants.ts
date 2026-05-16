export const PDF_MAX_BYTES = 25 * 1024 * 1024;
export const AUDIO_MAX_BYTES = 50 * 1024 * 1024;
export const MIN_EXTRACTED_CHARS = 200;

export const AUDIO_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/ogg",
  "audio/aac",
  "audio/webm",
  "audio/flac",
  "video/webm",
]);

export const AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".ogg", ".aac", ".webm", ".flac"];

export const FETCH_USER_AGENT =
  "Mozilla/5.0 (compatible; SkillProof/1.0; +https://skillproof.app)";
