import { mapSupabaseUser } from "@/lib/auth/map-user";
import { getUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthUser } from "@/contexts/auth-context";

export async function getAuthUser(): Promise<AuthUser | null> {
  const authUser = await getUser();
  if (!authUser) return null;

  try {
    const supabase = await createSupabaseServerClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("display_name, credits_balance, role, plans(name)")
      .eq("id", authUser.id)
      .single();

    if (error) {
      return mapSupabaseUser(authUser, null);
    }

    return mapSupabaseUser(authUser, profile);
  } catch {
    return mapSupabaseUser(authUser, null);
  }
}
