import type { Session, User } from "@supabase/supabase-js";
import type { AuthUser } from "@/contexts/auth-context";

type ProfileRow = {
  display_name: string | null;
  credits_balance: number;
  plans: { name: string } | { name: string }[] | null;
};

export function mapSupabaseUser(
  authUser: User,
  profile?: ProfileRow | null,
): AuthUser {
  const meta = authUser.user_metadata as { full_name?: string; name?: string };
  const name =
    profile?.display_name?.trim() ||
    meta.full_name?.trim() ||
    meta.name?.trim() ||
    authUser.email?.split("@")[0] ||
    "User";

  const planRecord = profile?.plans;
  const planName = Array.isArray(planRecord)
    ? planRecord[0]?.name
    : planRecord?.name;

  return {
    id: authUser.id,
    email: authUser.email ?? "",
    name: name.charAt(0).toUpperCase() + name.slice(1),
    avatarLetter: name.charAt(0).toUpperCase(),
    creditsBalance: profile?.credits_balance,
    planName: planName ?? undefined,
  };
}

export function mapSessionToUser(
  session: Session | null,
  profile?: ProfileRow | null,
): AuthUser | null {
  if (!session?.user) return null;
  return mapSupabaseUser(session.user, profile);
}
