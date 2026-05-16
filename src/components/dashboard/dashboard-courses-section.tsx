import Link from "next/link";
import { ArrowRight, BookOpen, Plus } from "lucide-react";

import { DashboardCourseCard } from "@/components/dashboard/dashboard-course-card";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import type { CourseRecord } from "@/types/course";

type DashboardCoursesSectionProps = {
  courses: CourseRecord[];
  /** When true, omits outer section spacing (used inside tab panel). */
  embedded?: boolean;
};

export function DashboardCoursesSection({
  courses,
  embedded = false,
}: DashboardCoursesSectionProps) {
  return (
    <section className={embedded ? "" : "mt-10"}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {!embedded && (
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/80 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              <BookOpen className="size-3.5" />
              Your library
            </span>
          )}
          <h2
            className={
              embedded
                ? "text-xl font-bold tracking-tight sm:text-2xl"
                : "mt-3 text-2xl font-bold tracking-tight sm:text-3xl"
            }
          >
            {embedded ? "All courses" : "My courses"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {courses.length === 0
              ? "Courses you generate appear here"
              : `${courses.length} course${courses.length !== 1 ? "s" : ""} in your library`}
          </p>
        </div>
        <Link
          href="/#upload"
          className="btn-gradient inline-flex shrink-0 items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold"
        >
          <Plus className="size-4" />
          New course
          <ArrowRight className="size-4 opacity-80" />
        </Link>
      </div>

      {courses.length === 0 ? (
        <DashboardEmptyState />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <DashboardCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
}
