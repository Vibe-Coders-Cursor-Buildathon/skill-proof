"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { DashboardContentHeader } from "@/components/dashboard/dashboard-content-header";
import { DashboardCoursesSection } from "@/components/dashboard/dashboard-courses-section";
import { DashboardOverviewTab } from "@/components/dashboard/dashboard-overview-tab";
import { DashboardPaidCoursesSection } from "@/components/dashboard/dashboard-paid-courses-section";
import { DashboardPlanTab } from "@/components/dashboard/dashboard-plan-tab";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import type { CourseRecord } from "@/types/course";
import type { PurchasedCourse } from "@/types/purchased-course";

export type DashboardTabId = "overview" | "courses" | "paid" | "plan";

const TAB_IDS: DashboardTabId[] = ["overview", "courses", "paid", "plan"];

type DashboardTabsProps = {
  displayName: string;
  email: string;
  avatarLetter: string;
  planName: string;
  credits: number;
  creditsMax: number;
  courses: CourseRecord[];
  purchasedCourses: PurchasedCourse[];
  canEditCourse?: boolean;
};

export function DashboardTabs({
  displayName,
  email,
  avatarLetter,
  planName,
  credits,
  creditsMax,
  courses,
  purchasedCourses,
  canEditCourse = false,
}: DashboardTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab: DashboardTabId = TAB_IDS.includes(tabParam as DashboardTabId)
    ? (tabParam as DashboardTabId)
    : "overview";

  const [activeTab, setActiveTab] = useState<DashboardTabId>(initialTab);

  useEffect(() => {
    if (tabParam && TAB_IDS.includes(tabParam as DashboardTabId)) {
      setActiveTab(tabParam as DashboardTabId);
    }
  }, [tabParam]);

  const handleTabChange = useCallback(
    (tab: DashboardTabId) => {
      setActiveTab(tab);
      router.replace(`/dashboard?tab=${tab}`, { scroll: false });
    },
    [router],
  );

  const goToCourses = useCallback(() => {
    handleTabChange("courses");
  }, [handleTabChange]);

  return (
    <div className="w-full py-6 sm:py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          displayName={displayName}
          email={email}
          avatarLetter={avatarLetter}
          planName={planName}
          credits={credits}
          courseCount={courses.length}
          paidCourseCount={purchasedCourses.length}
        />

        <main className="min-w-0 flex-1">
          <DashboardContentHeader activeTab={activeTab} />

          {activeTab === "overview" && (
            <DashboardOverviewTab
              courses={courses}
              courseCount={courses.length}
              credits={credits}
              creditsMax={creditsMax}
              planName={planName}
              onViewAllCourses={goToCourses}
              canEditCourse={canEditCourse}
            />
          )}

          {activeTab === "courses" && (
            <DashboardCoursesSection
              courses={courses}
              embedded
              canEditCourse={canEditCourse}
            />
          )}

          {activeTab === "paid" && (
            <DashboardPaidCoursesSection purchasedCourses={purchasedCourses} />
          )}

          {activeTab === "plan" && (
            <DashboardPlanTab
              planName={planName}
              credits={credits}
              creditsMax={creditsMax}
            />
          )}
        </main>
      </div>
    </div>
  );
}
