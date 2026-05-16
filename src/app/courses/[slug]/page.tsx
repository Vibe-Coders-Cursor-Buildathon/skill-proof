import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  GraduationCap,
  Lightbulb,
} from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { courseContentSchema } from "@/types/course";
import type { Concept } from "@/types/course";

export const dynamic = "force-dynamic";

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  beginner: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Beginner" },
  intermediate: { bg: "bg-amber-100", text: "text-amber-700", label: "Intermediate" },
  expert: { bg: "bg-red-100", text: "text-red-700", label: "Expert" },
};

const CONCEPT_COLORS = [
  "bg-indigo-50 border-indigo-100",
  "bg-violet-50 border-violet-100",
  "bg-sky-50 border-sky-100",
  "bg-emerald-50 border-emerald-100",
  "bg-amber-50 border-amber-100",
  "bg-pink-50 border-pink-100",
  "bg-teal-50 border-teal-100",
  "bg-orange-50 border-orange-100",
];

const CONCEPT_ICON_COLORS = [
  "bg-indigo-200 text-indigo-700",
  "bg-violet-200 text-violet-700",
  "bg-sky-200 text-sky-700",
  "bg-emerald-200 text-emerald-700",
  "bg-amber-200 text-amber-700",
  "bg-pink-200 text-pink-700",
  "bg-teal-200 text-teal-700",
  "bg-orange-200 text-orange-700",
];

export default async function CourseSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) notFound();

  const parsed = courseContentSchema.safeParse(data.content);
  if (!parsed.success) notFound();

  const course = parsed.data;
  const difficulty = DIFFICULTY_STYLES[data.difficulty as string] ?? DIFFICULTY_STYLES.beginner;

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>

        {/* Course header */}
        <div className="mb-8 rounded-3xl border border-border/60 bg-white p-8 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${difficulty.bg} ${difficulty.text}`}
            >
              {difficulty.label}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 uppercase">
              {data.language}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 capitalize">
              {data.source_type}
            </span>
          </div>

          <h1 className="mb-4 text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
            {course.title}
          </h1>

          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-5">
            <div className="mb-2 flex items-center gap-2 text-indigo-700">
              <BookOpen className="size-4" />
              <span className="text-xs font-bold uppercase tracking-wide">Course Summary</span>
            </div>
            <p className="text-sm leading-relaxed text-indigo-900/80">{course.summary}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Brain className="size-3.5" />
              {course.concepts.length} key concepts
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap className="size-3.5" />
              {course.flashcards.length} flashcards
            </span>
            <span className="flex items-center gap-1.5">
              <Lightbulb className="size-3.5" />
              {course.quiz.length} quiz questions
            </span>
          </div>
        </div>

        {/* Key Concepts */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Brain className="size-5 text-indigo-500" />
            Key Concepts
          </h2>
          <div className="space-y-3">
            {course.concepts.map((concept: Concept, i: number) => (
              <div
                key={i}
                className={`rounded-2xl border p-5 ${CONCEPT_COLORS[i % CONCEPT_COLORS.length]}`}
              >
                <div className="mb-2.5 flex items-center gap-3">
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${CONCEPT_ICON_COLORS[i % CONCEPT_ICON_COLORS.length]}`}
                  >
                    {i + 1}
                  </span>
                  <h3 className="font-semibold leading-snug">{concept.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-foreground/75 pl-10">
                  {concept.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Coming soon sections */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-dashed border-border/50 bg-white/60 p-6 text-center">
            <GraduationCap className="mx-auto mb-2 size-8 text-indigo-300" />
            <p className="text-sm font-semibold text-muted-foreground">Flashcards</p>
            <p className="mt-1 text-xs text-muted-foreground">{course.flashcards.length} cards · coming soon</p>
          </div>
          <div className="rounded-2xl border-2 border-dashed border-border/50 bg-white/60 p-6 text-center">
            <Lightbulb className="mx-auto mb-2 size-8 text-amber-300" />
            <p className="text-sm font-semibold text-muted-foreground">Quiz</p>
            <p className="mt-1 text-xs text-muted-foreground">{course.quiz.length} questions · coming soon</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
