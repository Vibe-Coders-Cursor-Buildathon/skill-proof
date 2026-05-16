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

const publishBodySchema = z.object({
  university_stamp: z
    .object({
      name: z.string(),
      logo_url: z.string().url().optional(),
    })
    .optional(),
});

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getUser();
    if (!user) {
      return unauthorized();
    }

    await requireFeature(user.id, "can_publish_course");

    const { slug } = await context.params;
    const body = await request.json().catch(() => ({}));
    const parsed = publishBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (parsed.data.university_stamp) {
      await requireFeature(user.id, "can_add_university_stamp");
    }

    const supabase = await createSupabaseServerClient();

    const { data: existing } = await supabase
      .from("courses")
      .select("id, user_id")
      .eq("slug", slug)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return forbidden("You can only publish your own courses");
    }

    const updatePayload: Record<string, unknown> = {
      is_published: true,
      published_at: new Date().toISOString(),
    };

    if (parsed.data.university_stamp) {
      updatePayload.university_stamp = parsed.data.university_stamp;
    }

    const { data, error } = await supabase
      .from("courses")
      .update(updatePayload)
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
