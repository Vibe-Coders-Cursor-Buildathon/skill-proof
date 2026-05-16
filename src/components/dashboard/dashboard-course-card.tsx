import Link from "next/link";
import { ArrowUpRight, Layers, Video, FileText, Link2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  formatCourseDate,
  getDifficultyLabel,
  getLanguageLabel,
} from "@/lib/courses/labels";
import type { CourseRecord } from "@/types/course";

const SOURCE_ICONS = {
  youtube: Video,
  pdf: FileText,
  article: Link2,
};

const SOURCE_HUES: Record<string, number> = {
  youtube: 275,
  pdf: 155,
  article: 220,
};

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
  intermediate: "border-amber-200/80 bg-amber-50 text-amber-700",
  expert: "border-rose-200/80 bg-rose-50 text-rose-700",
};

type DashboardCourseCardProps = {
  course: CourseRecord;
};

export function DashboardCourseCard({ course }: DashboardCourseCardProps) {
  const Icon = SOURCE_ICONS[course.source_type] ?? Video;
  const hue = SOURCE_HUES[course.source_type] ?? 275;
  const summary =
    typeof course.content?.summary === "string" ? course.content.summary : "";
  const conceptCount = Array.isArray(course.content?.concepts)
    ? course.content.concepts.length
    : 0;
  const flashcardCount = Array.isArray(course.content?.flashcards)
    ? course.content.flashcards.length
    : 0;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/90 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_-14px_oklch(0.45_0.12_275_/_18%)]"
    >
      <div
        className="relative flex h-32 items-end p-4"
        style={{
          background: `linear-gradient(135deg, oklch(0.78 0.1 ${hue}) 0%, oklch(0.58 0.16 ${hue}) 55%, oklch(0.48 0.14 ${hue + 15}) 100%)`,
        }}
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-white/25 text-white backdrop-blur-sm">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <span
          className={`absolute top-3 right-3 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold capitalize ${DIFFICULTY_STYLES[course.difficulty] ?? "border-slate-200 bg-slate-50 text-slate-600"}`}
        >
          {getDifficultyLabel(course.difficulty)}
        </span>
        <span className="absolute top-3 left-3 flex size-8 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-[0.65rem] font-medium">
            {getLanguageLabel(course.language)}
          </Badge>
          <Badge variant="outline" className="text-[0.65rem] font-medium capitalize">
            {course.source_type}
          </Badge>
        </div>

        <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug tracking-tight group-hover:text-primary">
          {course.title}
        </h3>

        {summary && (
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {summary}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium">
            <Layers className="size-3.5 text-indigo-500" />
            {conceptCount} concepts · {flashcardCount} cards
          </span>
          <span>{formatCourseDate(course.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
