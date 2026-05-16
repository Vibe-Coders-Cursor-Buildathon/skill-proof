import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/auth/session";
import {
  getMaxPublishedCourses,
  PlanFeatureError,
  PlanLimitError,
  requireFeature,
} from "@/lib/auth/plan-guard";
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
      .select("id, user_id, is_published")
      .eq("slug", slug)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return forbidden("You can only publish your own courses");
    }

    if (!existing.is_published) {
      const maxPublished = await getMaxPublishedCourses(user.id);
      if (maxPublished > 0) {
        const { count, error: countError } = await supabase
          .from("courses")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_published", true);

        if (countError) {
          throw countError;
        }

        if ((count ?? 0) >= maxPublished) {
          return forbidden(
            `Your plan allows publishing up to ${maxPublished} public course${maxPublished === 1 ? "" : "s"}. Upgrade to publish more.`,
          );
        }
      }
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
    if (error instanceof PlanFeatureError || error instanceof PlanLimitError) {
      return forbidden(error.message);
    }
    return handleApiError(error);
  }
}
