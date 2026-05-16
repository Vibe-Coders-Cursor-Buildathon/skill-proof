import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCreditBalance(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("credits_balance")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data.credits_balance;
}

export async function spendCourseCredit(
  userId: string,
  referenceId?: string,
) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc("spend_credit", {
    p_user_id: userId,
    p_reason: "course_generation",
    p_reference_id: referenceId ?? null,
    p_metadata: {},
  });

  if (error) {
    if (error.message.includes("insufficient_credits")) {
      return { ok: false as const, reason: "insufficient_credits" as const };
    }
    throw error;
  }

  return { ok: true as const, balance: data as number };
}
