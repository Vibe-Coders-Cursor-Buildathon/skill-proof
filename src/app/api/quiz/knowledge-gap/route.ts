import { NextResponse } from "next/server";

import { handleApiError, unauthorized } from "@/lib/api/errors";
import { getUser } from "@/lib/auth/session";
import { generateKnowledgeGapReport } from "@/lib/gemini/generate-knowledge-gap";
import { knowledgeGapRequestSchema } from "@/types/quiz";

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return unauthorized();
    }

    const body = await request.json();
    const parsed = knowledgeGapRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    if (data.wrongConcepts.length === 0) {
      return NextResponse.json({ weakAreas: [] });
    }

    const report = await generateKnowledgeGapReport({
      wrongConcepts: data.wrongConcepts,
      courseTitle: data.courseTitle,
      courseSummary: data.courseSummary,
      concepts: data.concepts,
      score: data.score,
      missedQuestions: data.missedQuestions ?? [],
      language: data.language ?? "en",
      difficulty: data.difficulty ?? "intermediate",
    });

    return NextResponse.json(report);
  } catch (error) {
    return handleApiError(error);
  }
}
