import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

import { handleApiError, insufficientCredits, unauthorized } from "@/lib/api/errors";
import { generateCourseFromContent } from "@/lib/gemini/generate-course";
import { getUser } from "@/lib/auth/session";
import { fetchYouTubeTranscript } from "@/lib/content/youtube";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCreditBalance, spendCourseCredit } from "@/lib/auth/credits";
import { generateCourseRequestSchema } from "@/types/api";
import { courseContentSchema } from "@/types/course";

const MAX_WAIT_SECS = 65;
const MAX_GEMINI_ATTEMPTS = 3;

function isParseError(err: unknown): boolean {
  return (
    err instanceof SyntaxError ||
    (err instanceof Error &&
      (err.message.includes("JSON") || err.message.includes("Unexpected")))
  );
}

function isRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : "";
  return (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("Too Many Requests")
  );
}

async function withGeminiRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;

  for (let attempt = 1; attempt <= MAX_GEMINI_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;

      if (attempt >= MAX_GEMINI_ATTEMPTS) break;

      if (isRateLimitError(err)) {
        const msg = err instanceof Error ? err.message : "";
        const match = msg.match(/retry in (\d+)/i);
        const delaySecs = match ? parseInt(match[1], 10) : 60;
        if (delaySecs > MAX_WAIT_SECS) break;
        console.log(`[generate] 429 — waiting ${delaySecs}s then retrying...`);
        await new Promise((r) => setTimeout(r, delaySecs * 1000));
        continue;
      }

      if (isParseError(err)) {
        console.log(`[generate] JSON parse failed (attempt ${attempt}) — retrying...`);
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }

      break;
    }
  }

  throw lastErr;
}

function slugify(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50)
    .replace(/-+$/, "");
  return `${base}-${id}`;
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const body = await request.json();
    console.log("[generate] request body:", JSON.stringify(body));

    const parsed = generateCourseRequestSchema.safeParse(body);
    if (!parsed.success) {
      console.error("[generate] ❌ Request validation failed:", parsed.error.flatten());
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { sourceType, url, language, difficulty } = parsed.data;
    console.log("[generate] parsed:", { sourceType, url, language, difficulty });

    // Check credits before doing any expensive work
    const balance = await getCreditBalance(user.id);
    if (balance < 1) {
      return insufficientCredits();
    }

    // Extract content based on source type
    let content = "";
    let sourceRef: string | undefined;

    if (sourceType === "youtube") {
      if (!url) {
        return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
      }
      console.log("[generate] fetching YouTube transcript for:", url);
      const transcriptResult = await fetchYouTubeTranscript(url, { language });
      content = transcriptResult.transcript;
      sourceRef = url;
      console.log("[generate] ✅ transcript words:", transcriptResult.wordCount);
    } else {
      return NextResponse.json(
        { error: "Only YouTube source is supported in this build." },
        { status: 422 },
      );
    }

    if (!content.trim()) {
      return NextResponse.json(
        { error: "No content could be extracted from the source." },
        { status: 422 },
      );
    }

    // Generate course via Gemini (with auto-retry on 429)
    console.log("[generate] calling Gemini... content length:", content.length, "chars");
    const courseContent = await withGeminiRetry(() =>
      generateCourseFromContent({ content, language, difficulty, sourceType }),
    );

    // Validate structure returned by Gemini
    const validated = courseContentSchema.safeParse(courseContent);
    if (!validated.success) {
      console.error("[generate] ❌ Gemini output failed Zod validation:", JSON.stringify(validated.error.flatten(), null, 2));
      console.error("[generate] Raw Gemini output:", JSON.stringify(courseContent, null, 2));
      return NextResponse.json(
        { error: "AI returned an unexpected structure. Please try again.", details: validated.error.flatten() },
        { status: 500 },
      );
    }

    console.log("[generate] ✅ Gemini output valid. title:", validated.data.title);

    const slug = slugify(validated.data.title, nanoid(8));
    console.log("[generate] slug:", slug, "user:", user.id);

    // Save course to Supabase
    const supabase = await createSupabaseServerClient();
    const { data: course, error: dbError } = await supabase
      .from("courses")
      .insert({
        slug,
        title: validated.data.title,
        source_type: sourceType,
        source_ref: sourceRef ?? null,
        language,
        difficulty,
        content: validated.data,
        user_id: user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.error("[generate] ❌ Supabase insert error:", dbError);
      throw dbError;
    }

    console.log("[generate] ✅ Course saved to DB. slug:", course.slug);

    // Spend 1 credit now that everything succeeded
    const creditResult = await spendCourseCredit(user.id, course.id);
    const newBalance = creditResult.ok ? creditResult.balance : balance - 1;
    console.log("[generate] ✅ Credit spent. New balance:", newBalance);

    return NextResponse.json(
      { slug: course.slug, course: validated.data, creditsBalance: newBalance },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("429") || message.includes("quota") || message.includes("Too Many Requests")) {
      const retryMatch = message.match(/retry in (\d+)/i);
      const seconds = retryMatch ? retryMatch[1] : "60";
      return NextResponse.json(
        { error: `Gemini API rate limit reached. Please wait ${seconds} seconds and try again.` },
        { status: 429 },
      );
    }
    return handleApiError(error);
  }
}
