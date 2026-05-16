import type { SupabaseClient } from "@supabase/supabase-js";

export const AUTH_PENDING_ACTION_KEY = "auth_pending_action";

export async function signInWithEmail(
  supabase: SupabaseClient,
  email: string,
  password: string,
) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(
  supabase: SupabaseClient,
  params: { email: string; password: string; fullName: string },
) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  return supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: { full_name: params.fullName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
}

export async function signInWithGoogle(
  supabase: SupabaseClient,
  redirectPath: string,
) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`,
    },
  });
}

export function markOAuthPendingAction() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(AUTH_PENDING_ACTION_KEY, "1");
}

export function consumeOAuthPendingAction(): boolean {
  if (typeof window === "undefined") return false;
  const pending = sessionStorage.getItem(AUTH_PENDING_ACTION_KEY) === "1";
  if (pending) {
    sessionStorage.removeItem(AUTH_PENDING_ACTION_KEY);
  }
  return pending;
}
