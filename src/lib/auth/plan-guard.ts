import type { PlanFeatureKey } from "@/config/plan-features";
import { planFeaturesSchema } from "@/types/plan";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export class PlanFeatureError extends Error {
  constructor(
    public feature: PlanFeatureKey,
    message = `Plan does not include feature: ${feature}`,
  ) {
    super(message);
    this.name = "PlanFeatureError";
  }
}

export async function getProfileWithPlan(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*, plans(*)")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  const plans = data.plans as Record<string, unknown>;
  const features = planFeaturesSchema.safeParse(plans.features);

  return {
    profile: data,
    plan: { ...plans, features: features.success ? features.data : null },
  };
}

export async function userHasFeature(
  userId: string,
  feature: PlanFeatureKey,
): Promise<boolean> {
  const result = await getProfileWithPlan(userId);
  if (!result?.plan.features) {
    return false;
  }
  return result.plan.features[feature] === true;
}

export async function requireFeature(
  userId: string,
  feature: PlanFeatureKey,
): Promise<void> {
  const allowed = await userHasFeature(userId, feature);
  if (!allowed) {
    throw new PlanFeatureError(feature);
  }
}
