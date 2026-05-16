"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { CourseCard } from "@/components/courses/course-card";
import { CoursesSidebar } from "@/components/courses/courses-sidebar";
import { Button } from "@/components/ui/button";
import { MOCK_COURSES } from "@/config/mock-courses";
import {
  DEFAULT_COURSE_FILTERS,
  filterAndSortCourses,
} from "@/lib/courses/filter";
import { cn } from "@/lib/utils";
import type { CourseFilters } from "@/types/course-listing";

export function CoursesCatalog() {
  const [filters, setFilters] = useState<CourseFilters>(DEFAULT_COURSE_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(
    () => filterAndSortCourses(MOCK_COURSES, filters),
    [filters],
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      {/* Mobile filter toggle */}
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          courses found
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <SlidersHorizontal className="size-4" />
          Filters
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setMobileFiltersOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <CoursesSidebar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={MOCK_COURSES.length}
        onClose={() => setMobileFiltersOpen(false)}
        className={cn(
          "lg:sticky lg:top-24 lg:w-72 lg:shrink-0",
          mobileFiltersOpen
            ? "fixed inset-y-0 left-0 z-50 w-[min(100%,20rem)] overflow-y-auto rounded-none border-r shadow-xl"
            : "hidden lg:flex",
        )}
      />

      {/* Grid */}
      <div className="min-w-0 flex-1">
        <p className="mb-6 hidden text-sm text-muted-foreground lg:block">
          Showing{" "}
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          of {MOCK_COURSES.length} public courses
        </p>

        {filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <EmptyResults onClear={() => setFilters(DEFAULT_COURSE_FILTERS)} />
        )}
      </div>
    </div>
  );
}

function EmptyResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
      <p className="text-lg font-semibold">No courses match your filters</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Try removing some filters or search with different keywords.
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-6 rounded-xl"
        onClick={onClear}
      >
        Clear filters
      </Button>
    </div>
  );
}
