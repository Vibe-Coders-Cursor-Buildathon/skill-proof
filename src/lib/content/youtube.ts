/**
 * YouTube URL helpers.
 *
 * Transcript extraction was previously handled here via youtube-transcript-plus,
 * but that path is blocked from Vercel's IP ranges. Course generation now
 * sends the YouTube URL straight to Gemini via fileData (see
 * src/lib/gemini/generate-course-from-youtube.ts), so this module only needs
 * to validate URLs.
 */

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
