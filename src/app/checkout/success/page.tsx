import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { getPricingPlan } from "@/config/pricing";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { confirmCheckoutSessionForUser } from "@/lib/stripe/confirm-checkout-session";
import { isStripeConfigured } from "@/lib/stripe/server";

export const metadata = {
  title: "Payment successful | SkillProof",
};

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const user = await getAuthUser();
  if (!user) {
    redirect("/?auth=signin");
  }

  const { session_id: sessionId } = await searchParams;
  let planName: string | null = null;
  let activatedNow = false;

  if (sessionId && isStripeConfigured()) {
    try {
      const result = await confirmCheckoutSessionForUser(sessionId, user.id);
      if (result.fulfilled && result.planId) {
        planName = getPricingPlan(result.planId).name;
        activatedNow = !result.alreadyFulfilled;
      }
    } catch (error) {
      console.error("[checkout success] confirm session failed", error);
    }
  }

  return (
    <PageShell wide>
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:py-24">
        <span className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="size-9" />
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Payment successful
        </h1>
        <p className="mt-3 text-muted-foreground">
          {planName && activatedNow
            ? `Your ${planName} plan is active and credits have been added to your account.`
            : planName
              ? `Your ${planName} plan is active.`
              : "Thank you! If credits are not visible yet, refresh your dashboard in a moment."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="btn-gradient inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-semibold text-white"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold hover:bg-muted/50"
          >
            Create a course
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
