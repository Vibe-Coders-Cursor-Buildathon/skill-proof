import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getPublicEnv, getServerEnv } from "@/config/env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    getPublicEnv();

  return createServerClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from Server Component; middleware handles refresh.
          }
        },
      },
    },
  );
}

/** Service-role client for admin operations (bypasses RLS). */
export function getSupabaseAdminClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    getPublicEnv();
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();

  const key = SUPABASE_SERVICE_ROLE_KEY ?? NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createClient(NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** @deprecated Use getSupabaseAdminClient() */
export const getSupabaseServerClient = getSupabaseAdminClient;
