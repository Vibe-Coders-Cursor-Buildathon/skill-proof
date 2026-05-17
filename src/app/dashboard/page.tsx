import { Suspense } from "react";
import { redirect } from "next/navigation";

import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { PageShell } from "@/components/layout/page-shell";
import { getUser } from "@/lib/auth/session";
import { getProfileWithPlan, userHasFeature } from "@/lib/auth/plan-guard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchUserCourses } from "@/lib/courses/fetch-user-courses";

export const metadata = {
  title: "Dashboard | SkillProof",
  description: "Manage your courses, credits, and certificates.",
};

function DashboardTabsFallback() {
  return (
    <div className="w-full space-y-6 py-8 sm:py-10">
      <div className="glass-card h-36 animate-pulse rounded-3xl" />
      <div className="glass-card h-14 animate-pulse rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card h-28 animate-pulse rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/?auth=signin&redirect=/dashboard");

  const [profileData, supabase] = await Promise.all([
    getProfileWithPlan(user.id),
    createSupabaseServerClient(),
  ]);

  const planRecord = profileData?.plan;
  const planName =
    planRecord && typeof planRecord === "object" && "name" in planRecord
      ? String(planRecord.name)
      : "Free";
  const creditsMax =
    planRecord &&
    typeof planRecord === "object" &&
    "included_credits_monthly" in planRecord
      ? Number(planRecord.included_credits_monthly) || 3
      : 3;
  const credits = profileData?.profile.credits_balance ?? 0;
  const displayName =
    profileData?.profile.display_name ??
    user.email?.split("@")[0] ??
    "Learner";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const typedCourses = await fetchUserCourses(supabase, user.id);
  const canEditCourse = await userHasFeature(user.id, "can_edit_course");

  return (
    <PageShell wide>
      <Suspense fallback={<DashboardTabsFallback />}>
        <DashboardTabs
          displayName={displayName}
          email={user.email ?? ""}
          avatarLetter={avatarLetter}
          planName={planName}
          credits={credits}
          creditsMax={creditsMax}
          courses={typedCourses}
          canEditCourse={canEditCourse}
        />
      </Suspense>
    </PageShell>
  );
}
