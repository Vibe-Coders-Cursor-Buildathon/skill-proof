"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, ShoppingBag } from "lucide-react";

import { DashboardPaidCourseCard } from "@/components/dashboard/dashboard-paid-course-card";
import { Button } from "@/components/ui/button";
import type { PurchasedCourse } from "@/types/purchased-course";

type DashboardPaidCoursesSectionProps = {
  purchasedCourses: PurchasedCourse[];
};

export function DashboardPaidCoursesSection({
  purchasedCourses,
}: DashboardPaidCoursesSectionProps) {
  const searchParams = useSearchParams();
  const justPurchasedSlug = searchParams.get("purchased");
  const justPurchased = justPurchasedSlug
    ? purchasedCourses.find((p) => p.course.slug === justPurchasedSlug)
    : null;

  return (
    <section>
      {justPurchased && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold text-emerald-900">Purchase complete</p>
            <p className="mt-1 text-sm text-emerald-800">
              <strong>{justPurchased.course.title}</strong> is in your library
              with full access. Open it below to start learning.
            </p>
          </div>
        </div>
      )}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mt-1 text-sm text-muted-foreground">
            {purchasedCourses.length === 0
              ? "Courses you buy from the public catalog appear here with full access"
              : `${purchasedCourses.length} purchased course${purchasedCourses.length !== 1 ? "s" : ""} — open any time for full lessons, flashcards, and quizzes`}
          </p>
        </div>
        <Button
          variant="outline"
          className="shrink-0 gap-2 rounded-xl border-indigo-200/80 font-semibold text-primary"
          render={<Link href="/courses" />}
        >
          Browse catalog
          <ArrowRight className="size-4" />
        </Button>
      </div>

      {purchasedCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <ShoppingBag className="size-7" />
          </span>
          <p className="mt-4 text-lg font-semibold">No paid courses yet</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            When you purchase a course from the public library, it will show up
            here so you can continue learning anytime.
          </p>
          <Link
            href="/courses"
            className="btn-gradient mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          >
            Explore public courses
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {purchasedCourses.map((item) => (
            <DashboardPaidCourseCard key={item.purchaseId} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
