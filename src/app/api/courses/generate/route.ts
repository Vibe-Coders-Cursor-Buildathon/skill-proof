import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/session";
import { getCreditBalance } from "@/lib/auth/credits";
import {
  handleApiError,
  insufficientCredits,
  unauthorized,
} from "@/lib/api/errors";
import { generateCourseRequestSchema } from "@/types/api";

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return unauthorized();
    }

    const body = await request.json();
    const parsed = generateCourseRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const balance = await getCreditBalance(user.id);
    if (balance < 1) {
      return insufficientCredits();
    }

    // Gemini pipeline not yet implemented — check balance only; spend via spendCourseCredit() after success.
    return NextResponse.json(
      {
        error: "Course generation not implemented",
        feature: "POST /api/courses/generate",
        creditsRemaining: balance,
      },
      { status: 501 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
