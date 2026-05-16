import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/errors";
import { requireAdminUser } from "@/lib/auth/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { error } = await requireAdminUser();
    if (error) return error;

    const admin = getSupabaseAdminClient();

    const { data: courses, error: coursesError } = await admin
      .from("courses")
      .select(
        "id, slug, title, is_published, published_at, created_at, user_id, difficulty, source_type",
      )
      .order("created_at", { ascending: false });

    if (coursesError) throw coursesError;

    const userIds = [
      ...new Set(
        (courses ?? [])
          .map((c) => c.user_id)
          .filter((id): id is string => id != null),
      ),
    ];

    const emailById = new Map<string, string>();
    let page = 1;
    while (emailById.size < userIds.length) {
      const { data, error: listError } = await admin.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      if (listError) throw listError;
      for (const u of data.users) {
        if (u.email && userIds.includes(u.id)) {
          emailById.set(u.id, u.email);
        }
      }
      if (data.users.length < 200) break;
      page += 1;
    }

    const { data: profiles } = await admin
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

    const nameById = new Map(
      (profiles ?? []).map((p) => [p.id, p.display_name]),
    );

    const result = (courses ?? []).map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      isPublished: c.is_published,
      publishedAt: c.published_at,
      createdAt: c.created_at,
      difficulty: c.difficulty,
      sourceType: c.source_type,
      ownerId: c.user_id,
      ownerName: c.user_id ? nameById.get(c.user_id) : null,
      ownerEmail: c.user_id ? emailById.get(c.user_id) : null,
    }));

    return NextResponse.json({ courses: result });
  } catch (err) {
    return handleApiError(err);
  }
}
