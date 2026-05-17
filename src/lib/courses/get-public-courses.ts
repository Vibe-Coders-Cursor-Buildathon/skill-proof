import { mapCourseRowToListing } from "@/lib/courses/map-to-listing";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CourseListing } from "@/types/course-listing";

export async function getPublicCourses(limit?: number): Promise<CourseListing[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("courses")
    .select(
      "id, slug, title, source_type, language, difficulty, content, content_edited, created_at, published_at, profiles(display_name)",
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false });

  if (limit != null) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    // Column missing before migration 00011 — show empty catalog instead of crashing
    if (error.code === "42703") {
      console.warn(
        "[getPublicCourses] Schema missing publish columns — run supabase/migrations/00011_publish_approval.sql",
      );
      return [];
    }
    throw error;
  }

  return (data ?? [])
    .map((row) =>
      mapCourseRowToListing({
        ...row,
        profiles: Array.isArray(row.profiles)
          ? row.profiles[0] ?? null
          : row.profiles,
      }),
    )
    .filter((c): c is CourseListing => c != null);
}
