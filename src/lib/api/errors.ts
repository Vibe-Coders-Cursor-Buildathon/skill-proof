import { NextResponse } from "next/server";
import { PlanFeatureError } from "@/lib/auth/plan-guard";
import { AdminRequiredError } from "@/lib/auth/role-guard";

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function insufficientCredits() {
  return NextResponse.json(
    { error: "Insufficient credits", code: "insufficient_credits" },
    { status: 402 },
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof PlanFeatureError) {
    return NextResponse.json(
      { error: error.message, code: "plan_feature_required", feature: error.feature },
      { status: 403 },
    );
  }

  if (error instanceof AdminRequiredError) {
    return forbidden(error.message);
  }

  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
