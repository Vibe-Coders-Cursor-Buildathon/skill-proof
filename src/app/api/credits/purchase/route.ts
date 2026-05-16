import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/auth/session";
import { requireFeature } from "@/lib/auth/plan-guard";
import { handleApiError, unauthorized } from "@/lib/api/errors";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const purchaseSchema = z.object({
  pack_slug: z.string(),
});

/**
 * Stub: grants credits without payment. Replace with Stripe webhook in production.
 */
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return unauthorized();
    }

    await requireFeature(user.id, "can_purchase_credits");

    const body = await request.json();
    const parsed = purchaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const admin = getSupabaseAdminClient();
    const { data: pack, error: packError } = await admin
      .from("credit_packs")
      .select("*")
      .eq("slug", parsed.data.pack_slug)
      .eq("is_active", true)
      .single();

    if (packError || !pack) {
      return NextResponse.json({ error: "Credit pack not found" }, { status: 404 });
    }

    const { data: balance, error: grantError } = await admin.rpc("grant_credits", {
      p_user_id: user.id,
      p_amount: pack.credits,
      p_reason: "purchase",
      p_reference_id: null,
      p_metadata: { pack_slug: pack.slug, stub: true },
    });

    if (grantError) {
      throw grantError;
    }

    return NextResponse.json({
      success: true,
      creditsGranted: pack.credits,
      balance,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
