import { PageShell } from "@/components/layout/page-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <PageShell>
      <div className="flex flex-1 items-center justify-center py-12">
        <SignupForm />
      </div>
    </PageShell>
  );
}
