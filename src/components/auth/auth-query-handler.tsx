"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export function AuthQueryHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openAuthModal } = useAuth();

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth !== "signin" && auth !== "signup") return;

    openAuthModal(auth);

    const redirect = searchParams.get("redirect");
    const next = redirect ? `/?redirect=${encodeURIComponent(redirect)}` : "/";
    router.replace(next);
  }, [searchParams, openAuthModal, router]);

  return null;
}
