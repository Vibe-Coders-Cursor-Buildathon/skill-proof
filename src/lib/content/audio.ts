import { getGeminiModel } from "@/lib/gemini/client";
import {
  AUDIO_EXTENSIONS,
  AUDIO_MAX_BYTES,
  AUDIO_MIME_TYPES,
  FETCH_USER_AGENT,
} from "@/lib/content/constants";
import { ContentExtractionError } from "@/lib/content/errors";
import { toExtractionResult } from "@/lib/content/utils";
import type { ContentExtractionResult } from "@/types/content";

function mimeFromFilename(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".m4a")) return "audio/mp4";
  if (lower.endsWith(".ogg")) return "audio/ogg";
  if (lower.endsWith(".aac")) return "audio/aac";
  if (lower.endsWith(".webm")) return "audio/webm";
  if (lower.endsWith(".flac")) return "audio/flac";
  return null;
}

function isAudioMime(mime: string): boolean {
  const base = mime.split(";")[0]?.trim().toLowerCase() ?? "";
  return AUDIO_MIME_TYPES.has(base) || base.startsWith("audio/");
}

function isAudioUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return AUDIO_EXTENSIONS.some((ext) => path.endsWith(ext));
  } catch {
    return false;
  }
}

export function validateAudioFile(file: File): void {
  if (file.size > AUDIO_MAX_BYTES) {
    throw new ContentExtractionError("Audio file must be under 50 MB.");
  }
  const mime = file.type || mimeFromFilename(file.name);
  if (mime && !isAudioMime(mime)) {
    throw new ContentExtractionError(
      "Upload a supported audio file (MP3, WAV, M4A, OGG, AAC, WebM, FLAC).",
    );
  }
}

/**
 * Transcribe audio bytes with Gemini (extraction step only).
 */
export async function transcribeAudio(
  buffer: Buffer,
  mimeType: string,
  sourceRef?: string,
): Promise<ContentExtractionResult> {
  if (buffer.length > AUDIO_MAX_BYTES) {
    throw new ContentExtractionError("Audio file must be under 50 MB.");
  }

  const model = getGeminiModel("gemini-2.5-flash");
  const base64 = buffer.toString("base64");

  let transcript: string;
  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType.split(";")[0]?.trim() || "audio/mpeg",
          data: base64,
        },
      },
      {
        text: "Transcribe this audio verbatim. Output only the spoken words as plain text with normal punctuation. Do not add headings, labels, or commentary.",
      },
    ]);
    transcript = result.response.text().trim();
  } catch {
    throw new ContentExtractionError(
      "Could not transcribe this audio. Try a shorter clip or a different format.",
    );
  }

  if (!transcript) {
    throw new ContentExtractionError(
      "No speech detected in this audio file.",
    );
  }

  return toExtractionResult(transcript, sourceRef);
}

export async function transcribeAudioFromFile(
  file: File,
): Promise<ContentExtractionResult> {
  validateAudioFile(file);
  const mime =
    file.type || mimeFromFilename(file.name) || "audio/mpeg";
  const buffer = Buffer.from(await file.arrayBuffer());
  return transcribeAudio(buffer, mime, file.name);
}

/**
 * Fetch a direct audio file URL and transcribe with Gemini.
 */
export async function transcribeAudioFromUrl(
  url: string,
): Promise<ContentExtractionResult> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": FETCH_USER_AGENT },
      redirect: "follow",
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    throw new ContentExtractionError(
      "Could not download this audio URL. Check the link and try again.",
    );
  }

  if (!response.ok) {
    throw new ContentExtractionError(
      `Could not download audio (HTTP ${response.status}).`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  const mimeBase = contentType.split(";")[0]?.trim().toLowerCase() ?? "";

  if (!isAudioMime(mimeBase) && !isAudioUrl(url)) {
    throw new ContentExtractionError(
      "Paste a direct link to an audio file (MP3, WAV, M4A, etc.), not a podcast or streaming page.",
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > AUDIO_MAX_BYTES) {
    throw new ContentExtractionError("Audio file must be under 50 MB.");
  }

  const mime =
    mimeBase && isAudioMime(mimeBase)
      ? mimeBase
      : mimeFromFilename(url) ?? "audio/mpeg";

  return transcribeAudio(buffer, mime, url);
}
