import { redirect } from "next/navigation";

import { CheckoutView } from "@/components/checkout/checkout-view";
import { PageShell } from "@/components/layout/page-shell";
import {
  getPricingPlan,
  isPricingPlanId,
} from "@/config/pricing";
import { getAuthUser } from "@/lib/auth/get-auth-user";

export const metadata = {
  title: "Checkout | SkillProof",
  description: "Complete your SkillProof subscription.",
};

type CheckoutPageProps = {
  searchParams: Promise<{ plan?: string; canceled?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { plan: planParam, canceled } = await searchParams;

  if (!planParam || !isPricingPlanId(planParam)) {
    redirect("/pricing");
  }

  if (planParam === "free") {
    redirect("/");
  }

  const user = await getAuthUser();
  if (!user) {
    const returnTo = encodeURIComponent(`/checkout?plan=${planParam}`);
    redirect(`/?auth=signin&redirect=${returnTo}`);
  }

  const plan = getPricingPlan(planParam);

  return (
    <PageShell wide>
      <CheckoutView
        plan={plan}
        userEmail={user.email}
        userName={user.name}
        canceled={canceled === "1"}
      />
    </PageShell>
  );
}
