import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { DashboardCourseCard } from "@/components/dashboard/dashboard-course-card";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import type { CourseRecord } from "@/types/course";

type DashboardCoursesSectionProps = {
  courses: CourseRecord[];
};

export function DashboardCoursesSection({
  courses,
}: DashboardCoursesSectionProps) {
  return (
    <section className="mt-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/80 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            <BookOpen className="size-3.5" />
            Your library
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            My courses
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {courses.length === 0
              ? "Courses you generate appear here"
              : `${courses.length} course${courses.length !== 1 ? "s" : ""} ready to study`}
          </p>
        </div>
        {courses.length > 0 && (
          <Link
            href="/#upload"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-indigo-700"
          >
            Add another
            <ArrowRight className="size-4" />
          </Link>
        )}
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
