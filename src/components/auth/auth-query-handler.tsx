"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { isPricingPlanId } from "@/config/pricing";
import { useAuth } from "@/contexts/auth-context";
import {
  getPendingCheckoutRedirect,
  savePendingCheckout,
} from "@/lib/checkout/pending-checkout";
import { markWelcomeOnboarding } from "@/lib/auth/pending-upload";

export function AuthQueryHandler() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, openAuthModal } = useAuth();

  useEffect(() => {
    const auth = searchParams.get("auth");
    const redirect = searchParams.get("redirect");
    const welcome =
      searchParams.get("welcome") === "1" ||
      searchParams.get("verified") === "1";

    if (redirect?.startsWith("/checkout")) {
      try {
        const plan = new URL(redirect, "http://local").searchParams.get("plan");
        if (plan && isPricingPlanId(plan)) {
          savePendingCheckout(plan);
        }
      } catch {
        // ignore
      }
    }

    if (auth === "signin" || auth === "signup") {
      openAuthModal(auth);
      const next = redirect
        ? `/?redirect=${encodeURIComponent(redirect)}`
        : "/";
      router.replace(next);
      return;
    }

    if (!isLoading && user && redirect) {
      router.replace(redirect);
      return;
    }

    if (
      !isLoading &&
      user &&
      pathname === "/" &&
      !auth &&
      !redirect &&
      !welcome
    ) {
      router.replace("/auth/after-login");
    }
  }, [searchParams, openAuthModal, router, user, isLoading, pathname]);

  useEffect(() => {
    const welcome =
      searchParams.get("welcome") === "1" ||
      searchParams.get("verified") === "1";

    if (welcome) {
      const checkoutRedirect = getPendingCheckoutRedirect();
      if (checkoutRedirect) {
        router.replace(checkoutRedirect);
        return;
      }

      markWelcomeOnboarding();
      router.replace("/", { scroll: false });

      requestAnimationFrame(() => {
        setTimeout(() => {
          document.getElementById("upload")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 400);
      });
    }
  }, [searchParams, router]);

  return null;
}
