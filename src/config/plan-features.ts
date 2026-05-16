export const PLAN_FEATURE_KEYS = [
  "can_purchase_credits",
  "can_purchase_plans",
  "can_edit_course",
  "can_publish_course",
  "can_add_university_stamp",
  "can_share_public_link",
] as const;

export type PlanFeatureKey = (typeof PLAN_FEATURE_KEYS)[number];

export type PlanFeatures = Record<PlanFeatureKey, boolean>;

export const DEFAULT_PLAN_FEATURES: PlanFeatures = {
  can_purchase_credits: true,
  can_purchase_plans: true,
  can_edit_course: false,
  can_publish_course: false,
  can_add_university_stamp: false,
  can_share_public_link: true,
};
