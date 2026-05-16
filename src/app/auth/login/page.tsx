import { Suspense } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <PageShell>
      <div className="flex flex-1 items-center justify-center py-12">
        <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </PageShell>
  );
}
