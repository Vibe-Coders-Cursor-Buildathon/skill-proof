import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";

import { DashboardCourseCard } from "@/components/dashboard/dashboard-course-card";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import type { CourseRecord } from "@/types/course";

type DashboardOverviewTabProps = {
  courses: CourseRecord[];
  courseCount: number;
  credits: number;
  creditsMax: number;
  planName: string;
  onViewAllCourses: () => void;
};

const QUICK_ACTIONS = [
  {
    href: "/#upload",
    icon: Plus,
    title: "Create course",
    description: "Turn a video or doc into a micro-course",
    accent: "from-indigo-500 to-violet-600",
  },
  {
    href: "/courses",
    icon: Compass,
    title: "Explore community",
    description: "Browse courses from other learners",
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    href: "/#pricing",
    icon: Zap,
    title: "Upgrade plan",
    description: "Unlock more credits and features",
    accent: "from-amber-500 to-orange-500",
  },
] as const;

export function DashboardOverviewTab({
  courses,
  courseCount,
  credits,
  creditsMax,
  planName,
  onViewAllCourses,
}: DashboardOverviewTabProps) {
  const recentCourses = courses.slice(0, 3);

  return (
    <div className="space-y-8">
      <DashboardStats
        courseCount={courseCount}
        credits={credits}
        creditsMax={creditsMax}
        planName={planName}
      />

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Quick actions
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="glass-card group flex flex-col gap-3 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span
                className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.accent} text-white shadow-md`}
              >
                <action.icon className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-foreground group-hover:text-primary">
                  {action.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {action.description}
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <BookOpen className="size-3.5" />
              Recent
            </span>
            <h3 className="mt-1 text-xl font-bold tracking-tight">
              Continue learning
            </h3>
          </div>
          {courses.length > 0 && (
            <button
              type="button"
              onClick={onViewAllCourses}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-indigo-700"
            >
              View all
              <ArrowRight className="size-4" />
            </button>
          )}
        </div>

        {courses.length === 0 ? (
          <DashboardEmptyState />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recentCourses.map((course) => (
              <DashboardCourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {courses.length > 3 && (
          <button
            type="button"
            onClick={onViewAllCourses}
            className="mt-5 w-full rounded-2xl border border-dashed border-border/80 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-primary"
          >
            + {courses.length - 3} more course{courses.length - 3 !== 1 ? "s" : ""}{" "}
            in your library
          </button>
        )}
      </section>

      {credits <= 1 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-5 py-4">
          <Sparkles className="size-5 shrink-0 text-amber-600" />
          <p className="flex-1 text-sm text-amber-900">
            <span className="font-semibold">Running low on credits.</span> Upgrade
            your plan to keep creating courses.
          </p>
          <Link
            href="/#pricing"
            className="shrink-0 text-sm font-semibold text-amber-800 hover:text-amber-950"
          >
            View plans
          </Link>
        </div>
      )}
    </div>
  );
}
