"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AdminCourseRow = {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  ownerEmail: string | null;
  ownerName: string | null;
  createdAt: string;
};

export function CoursesTable() {
  const [courses, setCourses] = useState<AdminCourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/api/admin/courses");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to load courses");
        }
        const data = await res.json();
        if (cancelled) return;
        setCourses(data.courses ?? []);
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load courses");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const togglePublish = async (course: AdminCourseRow) => {
    setTogglingId(course.id);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !course.isPublished }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to update course");
      }
      setLoading(true);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update course");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-48 animate-pulse rounded-2xl border border-border/60 bg-white" />
    );
  }

  if (error && courses.length === 0) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
      {error && (
        <p className="border-b border-border/40 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Owner</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr
                key={course.id}
                className="border-b border-border/40 last:border-0"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    {course.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {course.ownerEmail ?? course.ownerName ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={course.isPublished ? "default" : "secondary"}
                    className={
                      course.isPublished
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        : undefined
                    }
                  >
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(course.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={togglingId === course.id}
                    onClick={() => void togglePublish(course)}
                  >
                    {togglingId === course.id
                      ? "…"
                      : course.isPublished
                        ? "Unpublish"
                        : "Publish"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {courses.length === 0 && (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          No courses found.
        </p>
      )}
    </div>
  );
}
