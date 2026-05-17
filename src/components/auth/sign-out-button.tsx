"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export function SignOutButton() {
  const { logout, isLoggingOut } = useAuth();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isLoggingOut}
      onClick={() => logout()}
    >
      {isLoggingOut ? "Signing out…" : "Sign out"}
    </Button>
  );
}
