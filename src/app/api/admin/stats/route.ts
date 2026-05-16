import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/errors";
import { requireAdminUser } from "@/lib/auth/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { error } = await requireAdminUser();
    if (error) return error;

    const admin = getSupabaseAdminClient();

    const [
      { count: userCount },
      { count: courseCount },
      { count: publishedCount },
      { count: pendingCount },
      { data: profiles },
    ] = await Promise.all([
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin.from("courses").select("*", { count: "exact", head: true }),
      admin
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true)
        .eq("publish_status", "approved"),
      admin
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("publish_status", "pending"),
      admin.from("profiles").select("credits_balance"),
    ]);

    const totalCredits =
      profiles?.reduce((sum, p) => sum + (p.credits_balance ?? 0), 0) ?? 0;

    return NextResponse.json({
      users: userCount ?? 0,
      courses: courseCount ?? 0,
      publishedCourses: publishedCount ?? 0,
      pendingPublishReviews: pendingCount ?? 0,
      totalCredits,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
