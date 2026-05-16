export const PLAN_FEATURE_KEYS = [
  "can_purchase_credits",
  "can_purchase_plans",
  "can_edit_course",
  "can_publish_course",
  "can_add_university_stamp",
  "can_share_public_link",
  "can_issue_certificate",
] as const;

export type PlanFeatureKey = (typeof PLAN_FEATURE_KEYS)[number];

/** Boolean entitlements stored in plans.features JSONB */
export type PlanFeatures = Record<PlanFeatureKey, boolean>;

export const PLAN_LIMIT_KEYS = ["max_published_courses"] as const;
export type PlanLimitKey = (typeof PLAN_LIMIT_KEYS)[number];

export type PlanFeaturesWithLimits = PlanFeatures & {
  max_published_courses: number;
};

export const DEFAULT_PLAN_FEATURES: PlanFeaturesWithLimits = {
  can_purchase_credits: true,
  can_purchase_plans: true,
  can_edit_course: false,
  can_publish_course: false,
  can_add_university_stamp: false,
  can_share_public_link: true,
  can_issue_certificate: false,
  max_published_courses: 0,
};
