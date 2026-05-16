import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/auth/session";
import { requireFeature, PlanFeatureError } from "@/lib/auth/plan-guard";
import {
  handleApiError,
  unauthorized,
  forbidden,
} from "@/lib/api/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { courseContentSchema } from "@/types/course";

const patchBodySchema = z.object({
  content_edited: courseContentSchema,
});

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json({ course: data });
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getUser();
    if (!user) {
      return unauthorized();
    }

    await requireFeature(user.id, "can_edit_course");

    const { slug } = await context.params;
    const body = await request.json();
    const parsed = patchBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data: existing } = await supabase
      .from("courses")
      .select("id, user_id")
      .eq("slug", slug)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return forbidden("You can only edit your own courses");
    }

    const { data, error } = await supabase
      .from("courses")
      .update({ content_edited: parsed.data.content_edited })
      .eq("slug", slug)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ course: data });
  } catch (error) {
    if (error instanceof PlanFeatureError) {
      return forbidden(error.message);
    }
    return handleApiError(error);
  }
}
