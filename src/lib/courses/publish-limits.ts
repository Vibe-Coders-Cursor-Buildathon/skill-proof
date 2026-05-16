import type { SupabaseClient } from "@supabase/supabase-js";

import { PUBLISH_SLOT_STATUSES } from "@/lib/courses/publish-status";

export async function countPublishSlotsUsed(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("publish_status", PUBLISH_SLOT_STATUSES);

  if (error) {
    throw error;
  }

  return count ?? 0;
}
