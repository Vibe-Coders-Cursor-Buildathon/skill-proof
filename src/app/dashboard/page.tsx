import { redirect } from "next/navigation";

import { DashboardCoursesSection } from "@/components/dashboard/dashboard-courses-section";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { PageShell } from "@/components/layout/page-shell";
import { getUser } from "@/lib/auth/session";
import { getProfileWithPlan } from "@/lib/auth/plan-guard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CourseRecord } from "@/types/course";

export const metadata = {
  title: "Dashboard | SkillProof",
  description: "Manage your courses, credits, and certificates.",
};

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

  const { data: courses } = await supabase
    .from("courses")
    .select("id, slug, title, source_type, difficulty, language, created_at, content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const typedCourses = (courses ?? []) as CourseRecord[];

  return (
    <PageShell wide>
      <div className="w-full py-8 sm:py-10">
        <DashboardHero
          displayName={displayName}
          email={user.email ?? ""}
          avatarLetter={avatarLetter}
          planName={planName}
        />

        <div className="mt-6">
          <DashboardStats
            courseCount={typedCourses.length}
            credits={credits}
            creditsMax={creditsMax}
            planName={planName}
          />
        </div>

        <DashboardCoursesSection courses={typedCourses} />
      </div>
    </PageShell>
  );
}
