"use client";

import { useEffect, useState } from "react";

import { WelcomeBanner } from "@/components/home/welcome-banner";
import { useAuth } from "@/contexts/auth-context";
import {
  consumeWelcomeOnboarding,
  loadPendingUpload,
} from "@/lib/auth/pending-upload";

export function PostSignupWelcome() {
  const { user, isLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasSavedLink, setHasSavedLink] = useState(false);

  useEffect(() => {
    if (isLoading || !user) return;

    if (consumeWelcomeOnboarding()) {
      setShowWelcome(true);
      setHasSavedLink(Boolean(loadPendingUpload()?.url));
    }
  }, [isLoading, user]);

  if (!showWelcome || !user) return null;

  return (
    <WelcomeBanner
      userName={user.name}
      hasSavedLink={hasSavedLink}
      onDismiss={() => setShowWelcome(false)}
    />
  );
}
