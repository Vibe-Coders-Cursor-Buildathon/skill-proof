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
import { isValidCoursePriceCents } from "@/config/course-pricing";
import { countPublishSlotsUsed } from "@/lib/courses/publish-limits";
import type { PublishStatus } from "@/lib/courses/publish-status";
import {
  getPostgresErrorMessage,
  isMissingColumnError,
  schemaOutdatedResponse,
} from "@/lib/db/postgres-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publishBodySchema = z.object({
  price_cents: z.number().int(),
  university_stamp: z
    .object({
      name: z.string(),
      logo_url: z.string().url().optional(),
    })
    .optional(),
});

type RouteContext = { params: Promise<{ slug: string }> };

type CoursePublishRow = {
  id: string;
  user_id: string;
  is_published: boolean;
  publish_status?: string | null;
};

async function fetchCourseForPublish(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  slug: string,
): Promise<{ data: CoursePublishRow | null; schemaError: boolean }> {
  const full = await supabase
    .from("courses")
    .select("id, user_id, is_published, publish_status")
    .eq("slug", slug)
    .single();

  if (!full.error) {
    return { data: full.data as CoursePublishRow, schemaError: false };
  }

  if (!isMissingColumnError(full.error)) {
    throw full.error;
  }

  const basic = await supabase
    .from("courses")
    .select("id, user_id, is_published")
    .eq("slug", slug)
    .single();

  if (basic.error) {
    throw basic.error;
  }

  return {
    data: { ...basic.data, publish_status: "draft" } as CoursePublishRow,
    schemaError: true,
  };
}

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

    if (!isValidCoursePriceCents(parsed.data.price_cents)) {
      return NextResponse.json(
        {
          error:
            "Set a list price between $0.99 and $999.00 (whole cents).",
        },
        { status: 400 },
      );
    }

    if (parsed.data.university_stamp) {
      await requireFeature(user.id, "can_add_university_stamp");
    }

    const supabase = await createSupabaseServerClient();
    const { data: existing, schemaError: missingPublishColumns } =
      await fetchCourseForPublish(supabase, slug);

    if (!existing || existing.user_id !== user.id) {
      return forbidden("You can only publish your own courses");
    }

    const status = (existing.publish_status ?? "draft") as PublishStatus;

    if (status === "pending") {
      return NextResponse.json(
        { error: "This course is already awaiting admin approval." },
        { status: 409 },
      );
    }

    if (status === "approved" || existing.is_published === true) {
      return NextResponse.json(
        { error: "This course is already published on the public catalog." },
        { status: 409 },
      );
    }

    const maxPublished = await getMaxPublishedCourses(user.id);
    if (maxPublished > 0) {
      const used = await countPublishSlotsUsed(supabase, user.id);
      if (used >= maxPublished) {
        return forbidden(
          `Your plan allows up to ${maxPublished} public course${maxPublished === 1 ? "" : "s"} (including pending review). Upgrade to publish more.`,
        );
      }
    }

    const updatePayload: Record<string, unknown> = {
      publish_status: "pending",
      publish_requested_at: new Date().toISOString(),
      publish_reviewed_at: null,
      publish_rejection_reason: null,
      is_published: false,
      published_at: null,
      price_cents: parsed.data.price_cents,
      certificates_enabled: true,
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
      if (isMissingColumnError(error) || missingPublishColumns) {
        return NextResponse.json(
          schemaOutdatedResponse("Publishing"),
          { status: 503 },
        );
      }
      console.error("[publish] update failed:", getPostgresErrorMessage(error));
      throw error;
    }

    return NextResponse.json({
      course: data,
      message:
        "Your course was submitted for review. It will appear on the public courses page after an admin approves it.",
    });
  } catch (error) {
    if (error instanceof PlanFeatureError || error instanceof PlanLimitError) {
      return forbidden(error.message);
    }
    if (isMissingColumnError(error)) {
      return NextResponse.json(schemaOutdatedResponse("Publishing"), {
        status: 503,
      });
    }
    return handleApiError(error);
  }
}

/** Withdraw a pending publish request. */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await getUser();
    if (!user) {
      return unauthorized();
    }

    const { slug } = await context.params;
    const supabase = await createSupabaseServerClient();

    const { data: existing, schemaError } = await fetchCourseForPublish(
      supabase,
      slug,
    );

    if (!existing || existing.user_id !== user.id) {
      return forbidden("You can only manage your own courses");
    }

    if ((existing.publish_status ?? "draft") !== "pending") {
      return NextResponse.json(
        { error: "Only pending submissions can be withdrawn." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("courses")
      .update({
        publish_status: "draft",
        publish_requested_at: null,
      })
      .eq("slug", slug)
      .select()
      .single();

    if (error) {
      if (isMissingColumnError(error) || schemaError) {
        return NextResponse.json(
          schemaOutdatedResponse("Publishing"),
          { status: 503 },
        );
      }
      throw error;
    }

    return NextResponse.json({ course: data });
  } catch (error) {
    if (isMissingColumnError(error)) {
      return NextResponse.json(schemaOutdatedResponse("Publishing"), {
        status: 503,
      });
    }
    return handleApiError(error);
  }
}
