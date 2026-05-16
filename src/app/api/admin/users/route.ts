import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/errors";
import { requireAdminUser } from "@/lib/auth/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

async function listAllAuthEmails(admin: ReturnType<typeof getSupabaseAdminClient>) {
  const emailById = new Map<string, string>();
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    for (const u of data.users) {
      if (u.email) emailById.set(u.id, u.email);
    }
    if (data.users.length < perPage) break;
    page += 1;
  }

  return emailById;
}

export async function GET() {
  try {
    const { error } = await requireAdminUser();
    if (error) return error;

    const admin = getSupabaseAdminClient();

    const [{ data: profiles, error: profilesError }, emailById] =
      await Promise.all([
        admin
          .from("profiles")
          .select(
            "id, display_name, credits_balance, role, created_at, plan_id, plans(id, slug, name)",
          )
          .order("created_at", { ascending: false }),
        listAllAuthEmails(admin),
      ]);

    if (profilesError) throw profilesError;

    const users = (profiles ?? []).map((p) => {
      const planRecord = p.plans as
        | { id: string; slug: string; name: string }
        | { id: string; slug: string; name: string }[]
        | null;
      const plan = Array.isArray(planRecord) ? planRecord[0] : planRecord;
      return {
        id: p.id,
        email: emailById.get(p.id) ?? null,
        displayName: p.display_name,
        creditsBalance: p.credits_balance,
        role: p.role,
        createdAt: p.created_at,
        planId: p.plan_id,
        planSlug: plan?.slug ?? null,
        planName: plan?.name ?? null,
      };
    });

    const { data: plans } = await admin
      .from("plans")
      .select("id, slug, name")
      .eq("is_active", true)
      .order("sort_order");

    return NextResponse.json({ users, plans: plans ?? [] });
  } catch (err) {
    return handleApiError(err);
  }
}
