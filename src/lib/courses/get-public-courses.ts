import { mapCourseRowToListing } from "@/lib/courses/map-to-listing";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CourseListing } from "@/types/course-listing";

export async function getPublicCourses(limit?: number): Promise<CourseListing[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("courses")
    .select(
      "id, slug, title, source_type, language, difficulty, content, content_edited, created_at, published_at, price_cents, profiles(display_name)",
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false });

  if (limit != null) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    if (error.code === "42703") {
      let fallbackQuery = supabase
        .from("courses")
        .select(
          "id, slug, title, source_type, language, difficulty, content, content_edited, created_at, published_at, profiles(display_name)",
        )
        .eq("is_published", true)
        .order("published_at", { ascending: false, nullsFirst: false });
      if (limit != null) {
        fallbackQuery = fallbackQuery.limit(limit);
      }
      const { data: rows, error: fallbackError } = await fallbackQuery;
      if (fallbackError) {
        console.warn("[getPublicCourses] fallback query failed", fallbackError);
        return [];
      }
      return (rows ?? [])
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
