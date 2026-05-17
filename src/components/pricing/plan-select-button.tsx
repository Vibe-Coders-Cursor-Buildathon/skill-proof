"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import type { PricingPlanId } from "@/config/pricing";
import {
  getCheckoutPath,
  savePendingCheckout,
} from "@/lib/checkout/pending-checkout";

type PlanMode = "current" | "upgrade" | "purchase" | "default";

type PlanSelectButtonProps = Omit<
  ComponentProps<typeof Button>,
  "onClick" | "children" | "disabled"
> & {
  planId: PricingPlanId;
  /** Visible label for visitors / users on the free plan looking at the free card. */
  defaultLabel: string;
  /** Show the trailing arrow icon for the featured card's purchase / upgrade action. */
  featuredArrow?: boolean;
  /**
   * Optional authoritative current plan id (e.g. precomputed by a parent that
   * already reads auth state). When omitted, we derive it from the auth
   * context, which is the source of truth and reacts instantly to sign-in /
   * sign-out without waiting for a server re-render.
   */
  currentPlanId?: PricingPlanId | null;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

function planIdFromName(planName: string | undefined): PricingPlanId | null {
  if (!planName) return null;
  const lowered = planName.toLowerCase();
  if (
    lowered === "free" ||
    lowered === "individual" ||
    lowered === "business" ||
    lowered === "enterprise"
  ) {
    return lowered;
  }
  return null;
}

function resolveCurrentPlanId(
  explicit: PricingPlanId | null | undefined,
  isAuthed: boolean,
  planNameFromAuth: string | undefined,
): PricingPlanId | null {
  // Signed-out client always means "no current plan" — overrides any stale
  // server-rendered prop value left over from a previous authed render.
  if (!isAuthed) return null;
  if (explicit !== undefined && explicit !== null) return explicit;
  return planIdFromName(planNameFromAuth);
}

function computeMode(
  planId: PricingPlanId,
  currentPlanId: PricingPlanId | null,
): PlanMode {
  if (!currentPlanId) return "default";
  if (currentPlanId === planId) return "current";
  if (planId === "free") return "default";
  if (currentPlanId === "free") return "purchase";
  return "upgrade";
}

export function PlanSelectButton({
  planId,
  defaultLabel,
  featuredArrow = false,
  currentPlanId,
  onClick,
  className,
  ...props
}: PlanSelectButtonProps) {
  const router = useRouter();
  const { user, requireAuth } = useAuth();

  const resolvedCurrentPlanId = resolveCurrentPlanId(
    currentPlanId,
    Boolean(user),
    user?.planName,
  );
  const mode = computeMode(planId, resolvedCurrentPlanId);
  const isCurrent = mode === "current";

  const label =
    mode === "current"
      ? "Current plan"
      : mode === "upgrade"
        ? "Upgrade"
        : mode === "purchase"
          ? "Purchase"
          : defaultLabel;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (isCurrent) {
      e.preventDefault();
      return;
    }

    if (planId === "free") {
      if (user) {
        router.push("/#upload");
      } else {
        requireAuth(() => router.push("/#upload"));
      }
      return;
    }

    const checkoutPath = getCheckoutPath(planId);
    savePendingCheckout(planId);

    if (user) {
      router.push(checkoutPath);
      return;
    }

    requireAuth(() => {
      router.push(checkoutPath);
    });
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isCurrent}
      aria-current={isCurrent ? "true" : undefined}
      aria-label={isCurrent ? "This is your current plan" : undefined}
      className={className}
      {...props}
    >
      {isCurrent && <Check className="size-4" strokeWidth={2.5} />}
      {label}
      {!isCurrent && featuredArrow && <ArrowRight className="size-4" />}
    </Button>
  );
}
