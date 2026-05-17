import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function hasFulfilledCourseSession(
  userId: string,
  stripeSessionId: string,
): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from("course_purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("stripe_session_id", stripeSessionId)
    .maybeSingle();

  return data != null;
}

export async function fulfillCoursePurchase({
  userId,
  courseId,
  priceCents,
  stripeSessionId,
}: {
  userId: string;
  courseId: string;
  priceCents: number;
  stripeSessionId: string;
}): Promise<{ alreadyFulfilled: boolean }> {
  if (await hasFulfilledCourseSession(userId, stripeSessionId)) {
    return { alreadyFulfilled: true };
  }

  const admin = getSupabaseAdminClient();

  const { data: existing } = await admin
    .from("course_purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) {
    return { alreadyFulfilled: true };
  }

  const { error } = await admin.from("course_purchases").insert({
    user_id: userId,
    course_id: courseId,
    price_cents: priceCents,
    stripe_session_id: stripeSessionId,
  });

  if (error) {
    if (error.code === "23505") {
      return { alreadyFulfilled: true };
    }
    throw error;
  }

  return { alreadyFulfilled: false };
}
