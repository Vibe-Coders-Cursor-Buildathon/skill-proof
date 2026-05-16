import { NextResponse } from "next/server";
import { z } from "zod";

import { handleApiError } from "@/lib/api/errors";
import { requireAdminUser } from "@/lib/auth/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const patchCourseSchema = z.object({
  is_published: z.boolean(),
});

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

    const updatePayload: Record<string, unknown> = {
      is_published: parsed.data.is_published,
    };

    if (parsed.data.is_published) {
      updatePayload.published_at = new Date().toISOString();
    } else {
      updatePayload.published_at = null;
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
