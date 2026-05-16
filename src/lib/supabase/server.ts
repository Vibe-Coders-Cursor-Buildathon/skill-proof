import { createClient } from "@supabase/supabase-js";
import { getPublicEnv, getServerEnv } from "@/config/env";

export function getSupabaseServerClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    getPublicEnv();
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();

  const key = SUPABASE_SERVICE_ROLE_KEY ?? NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createClient(NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
