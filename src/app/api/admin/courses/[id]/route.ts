import { NextResponse } from "next/server";
import { z } from "zod";

import { handleApiError } from "@/lib/api/errors";
import { requireAdminUser } from "@/lib/auth/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const patchCourseSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("approve"),
  }),
  z.object({
    action: z.literal("reject"),
    rejection_reason: z.string().max(500).optional(),
  }),
  z.object({
    action: z.literal("unpublish"),
  }),
]);

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { error } = await requireAdminUser();
    if (error) return error;

    const { id } = await context.params;
    const body = await request.json();
    const parsed = patchCourseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const admin = getSupabaseAdminClient();
    const now = new Date().toISOString();

    let updatePayload: Record<string, unknown>;

    switch (parsed.data.action) {
      case "approve":
        updatePayload = {
          is_published: true,
          publish_status: "approved",
          published_at: now,
          publish_reviewed_at: now,
          publish_rejection_reason: null,
        };
        break;
      case "reject":
        updatePayload = {
          is_published: false,
          publish_status: "rejected",
          published_at: null,
          publish_reviewed_at: now,
          publish_rejection_reason:
            parsed.data.rejection_reason?.trim() ||
            "Does not meet our publishing guidelines.",
        };
        break;
      case "unpublish":
        updatePayload = {
          is_published: false,
          publish_status: "draft",
          published_at: null,
          publish_reviewed_at: now,
          publish_rejection_reason: null,
        };
        break;
    }

    const { data, error: updateError } = await admin
      .from("courses")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ course: data });
  } catch (err) {
    return handleApiError(err);
  }
}
