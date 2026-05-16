import { NextResponse } from "next/server";

import { handleApiError, unauthorized } from "@/lib/api/errors";
import { getUser } from "@/lib/auth/session";
import { generateAdaptiveQuiz } from "@/lib/gemini/generate-adaptive-quiz";
import { adaptiveQuizRequestSchema } from "@/types/quiz";

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return unauthorized();
    }

    const body = await request.json();
    const parsed = adaptiveQuizRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    if (data.mode === "remedial" && data.score >= 60) {
      return NextResponse.json(
        { error: "Remedial quiz is only for scores below 60%" },
        { status: 400 },
      );
    }

    if (data.mode === "challenge" && data.score <= 85) {
      return NextResponse.json(
        { error: "Challenge quiz is only for scores above 85%" },
        { status: 400 },
      );
    }

    let wrongConcepts = data.wrongConcepts;
    if (data.mode === "remedial" && wrongConcepts.length === 0) {
      wrongConcepts = data.concepts.slice(0, 3).map((c) => c.title);
    }

    const questions = await generateAdaptiveQuiz({
      mode: data.mode,
      score: data.score,
      wrongConcepts,
      concepts: data.concepts,
      courseTitle: data.courseTitle,
      courseSummary: data.courseSummary,
      language: data.language ?? "en",
      difficulty: data.difficulty ?? "intermediate",
      missedQuestions: data.missedQuestions,
    });

    return NextResponse.json({ questions });
  } catch (error) {
    return handleApiError(error);
  }
}
