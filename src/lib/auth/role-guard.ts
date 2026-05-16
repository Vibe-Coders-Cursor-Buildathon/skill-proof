import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/types/plan";

export class AdminRequiredError extends Error {
  constructor(message = "Admin access required") {
    super(message);
    this.name = "AdminRequiredError";
  }
}

export async function getProfileRole(
  userId: string,
): Promise<ProfileRole | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data.role as ProfileRole;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getProfileRole(userId);
  return role === "admin";
}

export async function requireAdmin(userId: string): Promise<void> {
  const allowed = await isAdmin(userId);
  if (!allowed) {
    throw new AdminRequiredError();
  }
}
