import type { SupabaseClient } from "@supabase/supabase-js";

import { getEffectiveCourseContent } from "@/lib/courses/get-effective-content";
import type { CourseRecord } from "@/types/course";
import type { PurchasedCourse } from "@/types/purchased-course";

const PURCHASE_SELECT = `
  id,
  price_cents,
  created_at,
  courses (
    id,
    slug,
    title,
    source_type,
    difficulty,
    language,
    created_at,
    content,
    content_edited,
    price_cents,
    is_published,
    publish_status
  )
`;

export async function fetchUserPurchasedCourses(
  supabase: SupabaseClient,
  userId: string,
): Promise<PurchasedCourse[]> {
  const { data, error } = await supabase
    .from("course_purchases")
    .select(PURCHASE_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") {
      return [];
    }
    throw error;
  }

  const results: PurchasedCourse[] = [];

  for (const row of data ?? []) {
    const raw = row.courses;
    const courseRow = Array.isArray(raw) ? raw[0] : raw;
    if (!courseRow || typeof courseRow !== "object") continue;

    const effective = getEffectiveCourseContent(
      courseRow.content,
      courseRow.content_edited,
    );
    if (!effective) continue;

    const course: CourseRecord = {
      id: courseRow.id,
      slug: courseRow.slug,
      title: effective.title,
      source_type: courseRow.source_type,
      source_ref: null,
      language: courseRow.language,
      difficulty: courseRow.difficulty,
      content: effective,
      created_at: courseRow.created_at,
      publish_status: courseRow.publish_status,
      is_published: courseRow.is_published,
    };

    results.push({
      purchaseId: row.id,
      purchasedAt: row.created_at,
      purchasePriceCents: row.price_cents,
      course,
    });
  }

  return results;
}
