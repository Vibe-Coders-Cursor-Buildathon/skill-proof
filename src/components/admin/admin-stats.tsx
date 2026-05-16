"use client";

import { BookOpen, GraduationCap, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";

type Stats = {
  users: number;
  courses: number;
  publishedCourses: number;
  totalCredits: number;
};

export function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to load stats");
        }
        setStats(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load stats");
      }
    })();
  }, []);

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-border/60 bg-white"
          />
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Users", value: stats.users, icon: Users },
    { label: "Courses", value: stats.courses, icon: BookOpen },
    { label: "Published", value: stats.publishedCourses, icon: GraduationCap },
    { label: "Total credits", value: stats.totalCredits, icon: Sparkles },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <div className="mt-2 flex items-end gap-1.5">
            <p className="text-3xl font-bold">{value}</p>
            <Icon className="mb-1 size-4 text-indigo-500" />
          </div>
        </div>
      ))}
    </div>
  );
}
