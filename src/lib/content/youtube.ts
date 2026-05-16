/**
 * YouTube transcript extraction via Innertube API (youtube-transcript-plus).
 * Avoids the legacy timedtext endpoint, which often returns empty bodies without PO tokens.
 */

import {
  fetchTranscript,
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
  YoutubeTranscriptNotAvailableLanguageError,
  YoutubeTranscriptTooManyRequestError,
  YoutubeTranscriptVideoUnavailableError,
} from "youtube-transcript-plus";

export type YouTubeTranscriptSegment = {
  text: string;
  offsetMs: number;
  durationMs: number;
};

export type YouTubeTranscriptResult = {
  videoId: string;
  language: string;
  transcript: string;
  segments: YouTubeTranscriptSegment[];
  wordCount: number;
};

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());

    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id && id.length >= 6 ? id : null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return v;

      const shorts = parsed.pathname.match(/\/shorts\/([^/?]+)/);
      if (shorts?.[1]) return shorts[1];

      const embed = parsed.pathname.match(/\/embed\/([^/?]+)/);
      if (embed?.[1]) return embed[1];
    }

    return null;
  } catch {
    return null;
  }
}

function decodeCaptionText(raw: string): string {
  return raw
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\n/g, " ")
    .trim();
}

function mapTranscriptError(error: unknown): Error {
  if (error instanceof YoutubeTranscriptDisabledError) {
    return new Error(
      "Subtitles are disabled for this video. Try another video with captions turned on.",
    );
  }
  if (error instanceof YoutubeTranscriptNotAvailableLanguageError) {
    return new Error(
      "No subtitles in the selected language. Try English or pick another video.",
    );
  }
  if (error instanceof YoutubeTranscriptNotAvailableError) {
    return new Error(
      "No captions found for this video. Try a video with subtitles (CC) enabled.",
    );
  }
  if (error instanceof YoutubeTranscriptVideoUnavailableError) {
    return new Error("This video is unavailable or private.");
  }
  if (error instanceof YoutubeTranscriptTooManyRequestError) {
    return new Error(
      "YouTube is rate-limiting requests. Wait a moment and try again.",
    );
  }
  if (error instanceof Error) return error;
  return new Error("Failed to extract transcript from YouTube.");
}

export async function fetchYouTubeTranscript(
  url: string,
  options?: { language?: string },
): Promise<YouTubeTranscriptResult> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL. Use a link like youtube.com/watch?v=...");
  }

  try {
    const lang = options?.language?.split("-")[0];
    const rawSegments = lang
      ? await fetchTranscript(url, { lang })
      : await fetchTranscript(url);

    const segments: YouTubeTranscriptSegment[] = rawSegments
      .map((s) => ({
        text: decodeCaptionText(s.text),
        offsetMs: Math.round(s.offset * 1000),
        durationMs: Math.round(s.duration * 1000),
      }))
      .filter((s) => s.text.length > 0);

    if (segments.length === 0) {
      throw new Error(
        "No transcript text found for this video. Try another video with subtitles enabled.",
      );
    }

    const language = rawSegments[0]?.lang ?? lang ?? "en";
    const transcript = segments.map((s) => s.text).join(" ");

    return {
      videoId,
      language,
      transcript,
      segments,
      wordCount: transcript.split(/\s+/).filter(Boolean).length,
    };
  } catch (error) {
    throw mapTranscriptError(error);
  }
}
