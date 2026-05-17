import type { SupabaseClient } from "@supabase/supabase-js";

import { isPaidPublicCourse } from "@/config/course-pricing";

type CourseAccessRow = {
  id: string;
  user_id: string | null;
  is_published: boolean;
  publish_status?: string | null;
  price_cents?: number | null;
};

export async function userPurchasedCourse(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("course_purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return false;
    throw error;
  }

  return data != null;
}

export function isPublicCatalogCourse(row: CourseAccessRow): boolean {
  return row.is_published === true || row.publish_status === "approved";
}

export async function resolveCourseAccess({
  supabase,
  userId,
  course,
  isAdmin = false,
}: {
  supabase: SupabaseClient;
  userId: string | null;
  course: CourseAccessRow;
  isAdmin?: boolean;
}): Promise<{
  isOwner: boolean;
  isPaidPublic: boolean;
  hasFullAccess: boolean;
  priceCents: number | null;
}> {
  const isOwner = Boolean(userId && course.user_id === userId);
  const priceCents =
    typeof course.price_cents === "number" ? course.price_cents : null;
  const isPaidPublic =
    isPublicCatalogCourse(course) && isPaidPublicCourse(priceCents);

  if (isOwner || isAdmin) {
    return { isOwner, isPaidPublic, hasFullAccess: true, priceCents };
  }

  if (!isPaidPublic) {
    return { isOwner, isPaidPublic, hasFullAccess: true, priceCents };
  }

  if (!userId) {
    return { isOwner, isPaidPublic, hasFullAccess: false, priceCents };
  }

  const purchased = await userPurchasedCourse(supabase, userId, course.id);
  return {
    isOwner,
    isPaidPublic,
    hasFullAccess: purchased,
    priceCents,
  };
}
