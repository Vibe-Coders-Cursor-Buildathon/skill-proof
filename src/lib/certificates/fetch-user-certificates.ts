import type { SupabaseClient } from "@supabase/supabase-js";

import type { UserCertificate } from "@/types/user-certificate";

type CertificateRow = {
  id: string;
  certificate_number: string;
  user_id: string;
  course_id: string;
  learner_name: string;
  course_title: string;
  quiz_score_percent: number;
  publisher_brand_name: string | null;
  publisher_logo_url: string | null;
  platform_name: string;
  issued_at: string;
  courses: { slug: string } | { slug: string }[] | null;
};

export async function fetchUserCertificates(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserCertificate[]> {
  const { data, error } = await supabase
    .from("certificates")
    .select(
      `
      id,
      certificate_number,
      user_id,
      course_id,
      learner_name,
      course_title,
      quiz_score_percent,
      publisher_brand_name,
      publisher_logo_url,
      platform_name,
      issued_at,
      courses ( slug )
    `,
    )
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });

  if (error) {
    if (error.code === "42P01" || error.code === "42703") {
      return [];
    }
    throw error;
  }

  const results: UserCertificate[] = [];

  for (const row of (data ?? []) as CertificateRow[]) {
    const rawCourse = row.courses;
    const course = Array.isArray(rawCourse) ? rawCourse[0] : rawCourse;
    if (!course?.slug) continue;

    results.push({
      id: row.id,
      certificate_number: row.certificate_number,
      user_id: row.user_id,
      course_id: row.course_id,
      learner_name: row.learner_name,
      course_title: row.course_title,
      quiz_score_percent: row.quiz_score_percent,
      publisher_brand_name: row.publisher_brand_name,
      publisher_logo_url: row.publisher_logo_url,
      platform_name: row.platform_name,
      issued_at: row.issued_at,
      course_slug: course.slug,
    });
  }

  return results;
}
