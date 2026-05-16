import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { CourseCard } from "@/components/courses/course-card";
import { Button } from "@/components/ui/button";
import { getPublicCourses } from "@/lib/courses/get-public-courses";

export async function LatestCoursesSection() {
  const latest = await getPublicCourses(6);

  if (latest.length === 0) {
    return null;
  }

  return (
    <section id="courses" className="py-[11px]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/80 px-4 py-1.5 text-sm font-semibold text-primary shadow-sm backdrop-blur-sm">
              <Sparkles className="size-4" />
              Community courses
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Latest public courses
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
              Explore micro-courses created by learners and teams. Start
              learning in seconds — no sign-up required to browse.
            </p>
          </div>
          <Button
            variant="outline"
            className="shrink-0 gap-2 rounded-xl border-indigo-200/80 font-semibold text-primary hover:bg-indigo-50/50"
            render={<Link href="/courses" />}
          >
            View all courses
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
