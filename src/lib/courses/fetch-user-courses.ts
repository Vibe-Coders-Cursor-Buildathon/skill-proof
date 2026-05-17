import type { SupabaseClient } from "@supabase/supabase-js";

import type { CourseRecord } from "@/types/course";

const COURSE_SELECT_WITH_PUBLISH =
  "id, slug, title, source_type, difficulty, language, created_at, content, is_published, publish_status";

const COURSE_SELECT_BASE =
  "id, slug, title, source_type, difficulty, language, created_at, content, is_published";

export async function fetchUserCourses(
  supabase: SupabaseClient,
  userId: string,
  limit = 20,
): Promise<CourseRecord[]> {
  const withPublish = await supabase
    .from("courses")
    .select(COURSE_SELECT_WITH_PUBLISH)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!withPublish.error) {
    return (withPublish.data ?? []) as CourseRecord[];
  }

  if (withPublish.error.code === "42703") {
    const fallback = await supabase
      .from("courses")
      .select(COURSE_SELECT_BASE)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (fallback.error) {
      throw fallback.error;
    }

    return (fallback.data ?? []) as CourseRecord[];
  }

  throw withPublish.error;
}
