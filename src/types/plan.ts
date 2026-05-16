import { z } from "zod";
import { PLAN_FEATURE_KEYS } from "@/config/plan-features";

const featureShape = Object.fromEntries(
  PLAN_FEATURE_KEYS.map((key) => [key, z.boolean()]),
) as Record<(typeof PLAN_FEATURE_KEYS)[number], z.ZodBoolean>;

export const planFeaturesSchema = z.object(featureShape);

export type PlanFeatures = z.infer<typeof planFeaturesSchema>;

export const planSchema = z.object({
  id: z.string().uuid(),
  slug: z.enum(["basic", "professional", "premium", "enterprise"]),
  name: z.string(),
  features: planFeaturesSchema,
  included_credits_monthly: z.number().int().min(0),
  sort_order: z.number().int(),
  is_active: z.boolean(),
});

export type Plan = z.infer<typeof planSchema>;

export const profileSchema = z.object({
  id: z.string().uuid(),
  plan_id: z.string().uuid(),
  credits_balance: z.number().int().min(0),
  display_name: z.string().nullable(),
  organization_name: z.string().nullable(),
  plan_renews_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Profile = z.infer<typeof profileSchema>;

export const profileWithPlanSchema = profileSchema.extend({
  plans: planSchema,
});

export type ProfileWithPlan = z.infer<typeof profileWithPlanSchema>;

export const creditPackSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  credits: z.number().int().positive(),
  price_cents: z.number().int().min(0),
  is_active: z.boolean(),
});

export type CreditPack = z.infer<typeof creditPackSchema>;
