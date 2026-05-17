import { redirect } from "next/navigation";

import { CheckoutView } from "@/components/checkout/checkout-view";
import { CreditsCheckoutView } from "@/components/checkout/credits-checkout-view";
import { PageShell } from "@/components/layout/page-shell";
import {
  getCreditPurchaseQuote,
  isValidCreditPurchaseAmount,
} from "@/config/credit-purchase";
import {
  getPricingPlan,
  isPricingPlanId,
} from "@/config/pricing";
import { getAuthUser } from "@/lib/auth/get-auth-user";

export const metadata = {
  title: "Checkout | SkillProof",
  description: "Complete your SkillProof purchase.",
};

type CheckoutPageProps = {
  searchParams: Promise<{
    plan?: string;
    type?: string;
    credits?: string;
    canceled?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { plan: planParam, type, credits: creditsParam, canceled } =
    await searchParams;

  const user = await getAuthUser();
  const isCreditsCheckout = type === "credits" || Boolean(creditsParam);

  if (isCreditsCheckout) {
    const credits = Number.parseInt(creditsParam ?? "", 10);
    if (!isValidCreditPurchaseAmount(credits)) {
      redirect("/dashboard?tab=plan");
    }

    if (!user) {
      const returnTo = encodeURIComponent(
        `/checkout?type=credits&credits=${credits}`,
      );
      redirect(`/?auth=signin&redirect=${returnTo}`);
    }

    const quote = getCreditPurchaseQuote(credits);

    return (
      <PageShell wide>
        <CreditsCheckoutView
          quote={quote}
          userEmail={user.email}
          userName={user.name}
          canceled={canceled === "1"}
        />
      </PageShell>
    );
  }

  if (!planParam || !isPricingPlanId(planParam)) {
    redirect("/pricing");
  }

  if (planParam === "free") {
    redirect("/");
  }

  if (!user) {
    const returnTo = encodeURIComponent(`/checkout?plan=${planParam}`);
    redirect(`/?auth=signin&redirect=${returnTo}`);
  }

  // Block re-subscribing to the same plan via direct URL.
  if (user.planName && user.planName.toLowerCase() === planParam) {
    redirect(`/dashboard?tab=plan&already_subscribed=${planParam}`);
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
