"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { markWelcomeOnboarding } from "@/lib/auth/pending-upload";

export function AuthQueryHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openAuthModal } = useAuth();

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth === "signin" || auth === "signup") {
      openAuthModal(auth);
      const redirect = searchParams.get("redirect");
      const next = redirect ? `/?redirect=${encodeURIComponent(redirect)}` : "/";
      router.replace(next);
    }
  }, [searchParams, openAuthModal, router]);

  useEffect(() => {
    const welcome =
      searchParams.get("welcome") === "1" ||
      searchParams.get("verified") === "1";

    if (welcome) {
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
