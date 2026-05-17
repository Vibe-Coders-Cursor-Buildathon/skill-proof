import { NextResponse } from "next/server";
import { z } from "zod";

import { handleApiError, unauthorized, forbidden } from "@/lib/api/errors";
import { requireFeature } from "@/lib/auth/plan-guard";
import { getUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const patchSchema = z.object({
  certificate_brand_name: z.string().max(120).optional(),
  certificate_logo_url: z
    .string()
    .url()
    .max(2048)
    .optional()
    .or(z.literal("")),
});

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return unauthorized();
    }

    await requireFeature(user.id, "can_add_university_stamp");

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "certificate_brand_name, certificate_logo_url, organization_name, display_name",
      )
      .eq("id", user.id)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ branding: data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return unauthorized();
    }

    await requireFeature(user.id, "can_add_university_stamp");

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();
    const update: Record<string, string | null> = {};

    if (parsed.data.certificate_brand_name !== undefined) {
      update.certificate_brand_name =
        parsed.data.certificate_brand_name.trim() || null;
    }
    if (parsed.data.certificate_logo_url !== undefined) {
      update.certificate_logo_url =
        parsed.data.certificate_logo_url.trim() || null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(update)
      .eq("id", user.id)
      .select(
        "certificate_brand_name, certificate_logo_url, organization_name, display_name",
      )
      .single();

    if (error) {
      if (error.code === "42703") {
        return NextResponse.json(
          {
            error:
              "Run migration 00015_certificates.sql in Supabase to enable certificate branding.",
          },
          { status: 503 },
        );
      }
      throw error;
    }

    return NextResponse.json({ branding: data });
  } catch (error) {
    return handleApiError(error);
  }
}
