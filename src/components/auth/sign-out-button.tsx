"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export function SignOutButton() {
  const { logout } = useAuth();

  return (
    <Button type="button" variant="outline" onClick={() => logout()}>
      Sign out
    </Button>
  );
}
