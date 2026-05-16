"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import type { PricingPlanId } from "@/config/pricing";
import {
  getCheckoutPath,
  savePendingCheckout,
} from "@/lib/checkout/pending-checkout";

type PlanSelectButtonProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  planId: PricingPlanId;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export function PlanSelectButton({
  planId,
  onClick,
  children,
  ...props
}: PlanSelectButtonProps) {
  const router = useRouter();
  const { user, requireAuth } = useAuth();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

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
    <Button type="button" onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}
