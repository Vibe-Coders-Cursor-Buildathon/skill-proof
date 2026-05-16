export type PricingPlanId = "free" | "individual" | "business" | "enterprise";

export type PricingFeature = {
  label: string;
  included: boolean;
};

export type PricingPlan = {
  id: PricingPlanId;
  name: string;
  tagline: string;
  credits: number;
  publishLimit: number | null;
  highlighted?: boolean;
  cta: string;
  features: PricingFeature[];
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Explore SkillProof before committing. No card needed.",
    credits: 3,
    publishLimit: 0,
    cta: "Start for free",
    features: [
      { label: "3 course generations to try", included: true },
      { label: "Full course experience (summary, flashcards, quiz)", included: true },
      { label: "Account & material upload", included: true },
      { label: "Edit course content or questions", included: false },
      { label: "Certificate on completion", included: false },
      { label: "Publish courses publicly", included: false },
    ],
  },
  {
    id: "individual",
    name: "Individual",
    tagline: "Turn your study material into structured courses — and earn certificates.",
    credits: 20,
    publishLimit: 0,
    highlighted: true,
    cta: "Get started",
    features: [
      { label: "20 courses per month", included: true },
      { label: "Edit AI-generated content & fix mistakes", included: true },
      { label: "Verified certificate for every completed course", included: true },
      { label: "Great for university students & self-learners", included: true },
      { label: "Publish courses to public page", included: false },
      { label: "Custom logo on certificate", included: false },
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "Train your team. Publish your courses. Brand your certificates.",
    credits: 40,
    publishLimit: 4,
    cta: "Get Business",
    features: [
      { label: "40 courses per month", included: true },
      { label: "Full course editing & AI correction", included: true },
      { label: "Publish up to 4 courses publicly", included: true },
      { label: "Company / institute logo on certificates", included: true },
      { label: "Verified certificates for all learners", included: true },
      { label: "Priority support", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Scale across your organization with full control and white-label branding.",
    credits: 100,
    publishLimit: 10,
    cta: "Contact sales",
    features: [
      { label: "100 courses per month", included: true },
      { label: "Full course creation & editing", included: true },
      { label: "Publish up to 10 courses publicly", included: true },
      { label: "Branded certificates with your logo", included: true },
      { label: "Everything in Business, at scale", included: true },
      { label: "Dedicated onboarding & support", included: true },
    ],
  },
];
