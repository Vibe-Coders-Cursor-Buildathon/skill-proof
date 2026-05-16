"use client";

import { Suspense } from "react";
import { AuthQueryHandler } from "@/components/auth/auth-query-handler";

export function HomePageClient() {
  return (
    <Suspense fallback={null}>
      <AuthQueryHandler />
    </Suspense>
  );
}
