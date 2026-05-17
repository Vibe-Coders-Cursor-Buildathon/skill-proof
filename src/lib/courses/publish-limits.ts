import type { SupabaseClient } from "@supabase/supabase-js";

import { isMissingColumnError } from "@/lib/db/postgres-errors";
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

  if (!error) {
    return count ?? 0;
  }

  if (isMissingColumnError(error)) {
    const { count: legacyCount, error: legacyError } = await supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_published", true);

    if (legacyError) {
      throw legacyError;
    }
    return legacyCount ?? 0;
  }

  throw error;
}
