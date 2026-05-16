import { createClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/config/env";

let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
      getPublicEnv();
    browserClient = createClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }
  return browserClient;
}
