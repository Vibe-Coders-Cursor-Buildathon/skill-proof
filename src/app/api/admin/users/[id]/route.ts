import { NextResponse } from "next/server";
import { z } from "zod";

import { handleApiError, forbidden } from "@/lib/api/errors";
import { requireAdminUser } from "@/lib/auth/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { profileRoleSchema } from "@/types/plan";

const patchUserSchema = z
  .object({
    role: profileRoleSchema.optional(),
    plan_id: z.string().uuid().optional(),
    credits_balance: z.number().int().min(0).optional(),
    grant_credits: z.number().int().positive().optional(),
  })
  .refine(
    (data) =>
      data.role !== undefined ||
      data.plan_id !== undefined ||
      data.credits_balance !== undefined ||
      data.grant_credits !== undefined,
    { message: "At least one field is required" },
  );

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { user: adminUser, error } = await requireAdminUser();
    if (error) return error;

    const { id } = await context.params;
    const body = await request.json();
    const parsed = patchUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (parsed.data.role !== "admin" && id === adminUser!.id) {
      return forbidden("You cannot remove your own admin role");
    }

    const admin = getSupabaseAdminClient();

    if (parsed.data.grant_credits !== undefined) {
      const { error: grantError } = await admin.rpc("grant_credits", {
        p_user_id: id,
        p_amount: parsed.data.grant_credits,
        p_reason: "admin_adjustment",
        p_metadata: { admin_id: adminUser!.id },
      });
      if (grantError) throw grantError;
    }

    if (parsed.data.credits_balance !== undefined) {
      const { error: setError } = await admin.rpc("admin_set_credits", {
        p_user_id: id,
        p_balance: parsed.data.credits_balance,
      });
      if (setError) throw setError;
    }

    const profileUpdate: Record<string, unknown> = {};
    if (parsed.data.role !== undefined) profileUpdate.role = parsed.data.role;
    if (parsed.data.plan_id !== undefined) {
      profileUpdate.plan_id = parsed.data.plan_id;
    }

    if (Object.keys(profileUpdate).length > 0) {
      const { data, error: updateError } = await admin
        .from("profiles")
        .update(profileUpdate)
        .eq("id", id)
        .select("*, plans(id, slug, name)")
        .single();

      if (updateError) throw updateError;
      return NextResponse.json({ profile: data });
    }

    const { data, error: fetchError } = await admin
      .from("profiles")
      .select("*, plans(id, slug, name)")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    return NextResponse.json({ profile: data });
  } catch (err) {
    return handleApiError(err);
  }
}
