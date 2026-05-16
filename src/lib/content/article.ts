import * as cheerio from "cheerio";

import { FETCH_USER_AGENT } from "@/lib/content/constants";
import { ContentExtractionError } from "@/lib/content/errors";
import { normalizeWhitespace, toExtractionResult } from "@/lib/content/utils";
import type { ContentExtractionResult } from "@/types/content";

const MAIN_SELECTORS = [
  "article",
  "main",
  '[role="main"]',
  ".post-content",
  ".article-content",
  ".article-body",
  ".entry-content",
  "#content",
];

/**
 * Fetch a web page and extract readable article text (no Gemini).
 */
export async function fetchArticleContent(
  url: string,
): Promise<ContentExtractionResult> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "User-Agent": FETCH_USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new ContentExtractionError(
      "Could not reach this URL. Check the link and try again.",
    );
  }

  if (!response.ok) {
    throw new ContentExtractionError(
      `Could not fetch this page (HTTP ${response.status}).`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
    throw new ContentExtractionError(
      "This URL does not appear to be a web page. Paste a link to an article or blog post.",
    );
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  $("script, style, nav, footer, header, aside, noscript, iframe, svg").remove();

  let text = "";
  for (const selector of MAIN_SELECTORS) {
    const el = $(selector).first();
    if (el.length > 0) {
      text = el.text();
      break;
    }
  }

  if (!text.trim()) {
    text = $("body").text();
  }

  text = normalizeWhitespace(text);

  if (text.length < 200) {
    throw new ContentExtractionError(
      "Could not extract enough text from this page. The site may block scrapers or require JavaScript.",
    );
  }

  return toExtractionResult(text, url);
}
