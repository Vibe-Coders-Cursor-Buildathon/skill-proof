import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Plus,
  Sparkles,
  Video,
  FileText,
  Link2,
} from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getUser } from "@/lib/auth/session";
import { getProfileWithPlan } from "@/lib/auth/plan-guard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CourseRecord } from "@/types/course";

export const metadata = {
  title: "Dashboard | SkillProof",
  description: "Manage your courses, credits, and certificates.",
};

const SOURCE_ICONS = {
  youtube: Video,
  pdf: FileText,
  article: Link2,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  expert: "bg-red-100 text-red-700",
};

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/?auth=signin&redirect=/dashboard");

  const [profileData, supabase] = await Promise.all([
    getProfileWithPlan(user.id),
    createSupabaseServerClient(),
  ]);

  const planName =
    profileData?.plan && typeof profileData.plan === "object" && "name" in profileData.plan
      ? String(profileData.plan.name)
      : "Free";
  const credits = profileData?.profile.credits_balance ?? 0;
  const displayName = profileData?.profile.display_name ?? user.email?.split("@")[0] ?? "Learner";

  const { data: courses } = await supabase
    .from("courses")
    .select("id, slug, title, source_type, difficulty, language, created_at, content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const typedCourses = (courses ?? []) as CourseRecord[];

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {displayName} 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your personal learning dashboard
            </p>
          </div>
          <Link
            href="/#upload"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            Create course
          </Link>
        </div>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Courses created
            </p>
            <p className="mt-2 text-3xl font-bold">{typedCourses.length}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Credits left
            </p>
            <div className="mt-2 flex items-end gap-1.5">
              <p className="text-3xl font-bold">{credits}</p>
              <Sparkles className="mb-1 size-4 text-indigo-500" />
            </div>
          </div>
          <div className="col-span-2 rounded-2xl border border-border/60 bg-white p-5 shadow-sm sm:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Plan
            </p>
            <p className="mt-2 text-3xl font-bold">{planName}</p>
          </div>
        </div>

        {/* Courses section */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <BookOpen className="size-5 text-indigo-500" />
            My Courses
          </h2>
          {typedCourses.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {typedCourses.length} course{typedCourses.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {typedCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/60 bg-white/60 py-20 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <GraduationCap className="size-8" />
            </span>
            <h3 className="mt-5 text-lg font-bold">No courses yet</h3>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Paste a YouTube link to generate your first micro-course in under 60 seconds.
            </p>
            <Link
              href="/#upload"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:opacity-90"
            >
              <Plus className="size-4" />
              Create my first course
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {typedCourses.map((course) => {
              const Icon = SOURCE_ICONS[course.source_type] ?? BookOpen;
              const summary =
                typeof course.content?.summary === "string"
                  ? course.content.summary
                  : "";
              const conceptCount = Array.isArray(course.content?.concepts)
                ? course.content.concepts.length
                : 0;

              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="group flex flex-col rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/10"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                      <Icon className="size-4" />
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${DIFFICULTY_COLORS[course.difficulty] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {course.difficulty}
                    </span>
                  </div>

                  <h3 className="mb-1.5 line-clamp-2 text-sm font-bold leading-snug text-foreground group-hover:text-indigo-700">
                    {course.title}
                  </h3>

                  {summary && (
                    <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {summary}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-3 text-xs text-muted-foreground border-t border-border/40">
                    <span>{conceptCount} concepts</span>
                    <span>
                      {new Date(course.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 border-t border-border/40 pt-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <SignOutButton />
        </div>
      </div>
    </PageShell>
  );
}
