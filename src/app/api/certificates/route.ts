import { NextResponse } from "next/server";

import { handleApiError, unauthorized } from "@/lib/api/errors";
import { getUser } from "@/lib/auth/session";
import { fetchUserCertificates } from "@/lib/certificates/fetch-user-certificates";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return unauthorized();
    }

    const supabase = await createSupabaseServerClient();
    const certificates = await fetchUserCertificates(supabase, user.id);

    return NextResponse.json({ certificates });
  } catch (error) {
    return handleApiError(error);
  }
}
