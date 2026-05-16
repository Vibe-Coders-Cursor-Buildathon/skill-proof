"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  publishStatusLabel,
  type PublishStatus,
} from "@/lib/courses/publish-status";

type AdminCourseRow = {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  publishStatus: PublishStatus;
  publishedAt: string | null;
  publishRequestedAt: string | null;
  publishRejectionReason: string | null;
  ownerEmail: string | null;
  ownerName: string | null;
  createdAt: string;
};

export function CoursesTable() {
  const [courses, setCourses] = useState<AdminCourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filter, setFilter] = useState<"all" | "pending">("pending");

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

  const pendingCount = useMemo(
    () => courses.filter((c) => c.publishStatus === "pending").length,
    [courses],
  );

  const visible = useMemo(() => {
    const list =
      filter === "pending"
        ? courses.filter((c) => c.publishStatus === "pending")
        : courses;
    return [...list].sort((a, b) => {
      const order = (s: PublishStatus) =>
        s === "pending" ? 0 : s === "approved" ? 1 : 2;
      return order(a.publishStatus) - order(b.publishStatus);
    });
  }, [courses, filter]);

  const runAction = async (
    course: AdminCourseRow,
    action: "approve" | "reject" | "unpublish",
    rejectionReason?: string,
  ) => {
    setActingId(course.id);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejection_reason: rejectionReason }),
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
      setActingId(null);
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={filter === "pending" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => setFilter("pending")}
        >
          Pending approval
          {pendingCount > 0 && (
            <span className="ml-1.5 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
              {pendingCount}
            </span>
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => setFilter("all")}
        >
          All courses
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
        {error && (
          <p className="border-b border-border/40 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Owner</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Requested</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((course) => (
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
                    <StatusBadge status={course.publishStatus} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {course.publishRequestedAt
                      ? new Date(course.publishRequestedAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {course.publishStatus === "pending" && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            disabled={actingId === course.id}
                            className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                            onClick={() => void runAction(course, "approve")}
                          >
                            {actingId === course.id ? "…" : "Approve"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={actingId === course.id}
                            className="rounded-xl"
                            onClick={() => {
                              const reason = window.prompt(
                                "Rejection reason (optional):",
                              );
                              if (reason === null) return;
                              void runAction(
                                course,
                                "reject",
                                reason || undefined,
                              );
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {course.publishStatus === "approved" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={actingId === course.id}
                          className="rounded-xl"
                          onClick={() => void runAction(course, "unpublish")}
                        >
                          {actingId === course.id ? "…" : "Unpublish"}
                        </Button>
                      )}
                      {course.publishStatus === "rejected" && (
                        <span className="max-w-[12rem] truncate text-xs text-muted-foreground">
                          {course.publishRejectionReason}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visible.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {filter === "pending"
              ? "No courses awaiting approval."
              : "No courses found."}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: PublishStatus }) {
  const styles: Record<PublishStatus, string> = {
    draft: "bg-muted text-muted-foreground",
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <Badge className={styles[status]}>{publishStatusLabel(status)}</Badge>
  );
}
