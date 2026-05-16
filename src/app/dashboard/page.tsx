import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getUser } from "@/lib/auth/session";
import { getProfileWithPlan } from "@/lib/auth/plan-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const data = await getProfileWithPlan(user.id);
  const planName =
    data?.plan && typeof data.plan === "object" && "name" in data.plan
      ? String(data.plan.name)
      : "Basic";

  return (
    <PageShell>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Plan
              <Badge variant="secondary">{planName}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Credits: </span>
              <span className="font-medium">
                {data?.profile.credits_balance ?? 0}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Display name: </span>
              {data?.profile.display_name ?? "—"}
            </p>
          </CardContent>
        </Card>

        <SignOutButton />

        <Button nativeButton={false} render={<Link href="/" />}>
          Create a course
        </Button>
      </div>
    </PageShell>
  );
}
