/**
 * YouTube transcript extraction via public caption tracks.
 * Gemini is used later in /api/courses/generate to turn transcript → course JSON.
 */

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

type CaptionTrack = {
  baseUrl: string;
  languageCode: string;
  name?: { simpleText?: string };
};

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

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
    .replace(/\n/g, " ")
    .trim();
}

function parseCaptionXml(xml: string): YouTubeTranscriptSegment[] {
  const segments: YouTubeTranscriptSegment[] = [];
  const regex = /<text start="([^"]+)" dur="([^"]+)"[^>]*>([^<]*)<\/text>/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(xml)) !== null) {
    const text = decodeCaptionText(match[3]);
    if (!text) continue;
    segments.push({
      text,
      offsetMs: Math.round(parseFloat(match[1]) * 1000),
      durationMs: Math.round(parseFloat(match[2]) * 1000),
    });
  }

  return segments;
}

async function fetchCaptionTracks(videoId: string): Promise<CaptionTrack[]> {
  const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const res = await fetch(pageUrl, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Could not load YouTube video (HTTP ${res.status}).`);
  }

  const html = await res.text();
  const marker = '"captionTracks":';
  const start = html.indexOf(marker);
  if (start === -1) {
    throw new Error(
      "No captions found for this video. The uploader may have disabled subtitles.",
    );
  }

  let jsonStart = start + marker.length;
  while (html[jsonStart] === " ") jsonStart++;

  if (html[jsonStart] !== "[") {
    throw new Error("Could not parse caption tracks from YouTube.");
  }

  let depth = 0;
  let jsonEnd = jsonStart;
  for (let i = jsonStart; i < html.length; i++) {
    const ch = html[i];
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        jsonEnd = i + 1;
        break;
      }
    }
  }

  const raw = html.slice(jsonStart, jsonEnd).replace(/\\u0026/g, "&");
  const tracks = JSON.parse(raw) as CaptionTrack[];

  if (!Array.isArray(tracks) || tracks.length === 0) {
    throw new Error(
      "No captions found for this video. Try a video with English subtitles enabled.",
    );
  }

  return tracks;
}

function pickCaptionTrack(tracks: CaptionTrack[], preferredLang?: string): CaptionTrack {
  if (preferredLang) {
    const exact = tracks.find((t) => t.languageCode === preferredLang);
    if (exact) return exact;
    const prefix = tracks.find((t) => t.languageCode.startsWith(preferredLang));
    if (prefix) return prefix;
  }

  const english =
    tracks.find((t) => t.languageCode === "en") ??
    tracks.find((t) => t.languageCode.startsWith("en"));

  return english ?? tracks[0];
}

export async function fetchYouTubeTranscript(
  url: string,
  options?: { language?: string },
): Promise<YouTubeTranscriptResult> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL. Use a link like youtube.com/watch?v=...");
  }

  const tracks = await fetchCaptionTracks(videoId);
  const track = pickCaptionTrack(tracks, options?.language);

  const captionRes = await fetch(track.baseUrl, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 0 },
  });

  if (!captionRes.ok) {
    throw new Error(`Failed to download captions (HTTP ${captionRes.status}).`);
  }

  const xml = await captionRes.text();
  const segments = parseCaptionXml(xml);

  if (segments.length === 0) {
    throw new Error("Caption file was empty. This video may not have usable subtitles.");
  }

  const transcript = segments.map((s) => s.text).join(" ");
  return {
    videoId,
    language: track.languageCode,
    transcript,
    segments,
    wordCount: transcript.split(/\s+/).filter(Boolean).length,
  };
}
