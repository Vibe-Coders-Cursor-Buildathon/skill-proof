import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Layers,
  Lightbulb,
  Pencil,
  Play,
  Video,
  FileText,
  Link2,
  Mic,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  formatCourseDate,
  getDifficultyLabel,
  getLanguageLabel,
} from "@/lib/courses/labels";
import {
  publishStatusLabel,
  type PublishStatus,
} from "@/lib/courses/publish-status";
import { cn } from "@/lib/utils";
import type { CourseRecord } from "@/types/course";

const SOURCE_ICONS = {
  youtube: Video,
  pdf: FileText,
  article: Link2,
  audio: Mic,
};

const SOURCE_HUES: Record<string, number> = {
  youtube: 275,
  pdf: 155,
  article: 220,
  audio: 30,
};

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
  intermediate: "border-amber-200/80 bg-amber-50 text-amber-700",
  expert: "border-rose-200/80 bg-rose-50 text-rose-700",
};

type DashboardCourseCardProps = {
  course: CourseRecord;
  canEdit?: boolean;
};

export function DashboardCourseCard({
  course,
  canEdit = false,
}: DashboardCourseCardProps) {
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
  const quizCount = Array.isArray(course.content?.quiz)
    ? course.content.quiz.length
    : 0;
  const publishStatus = (course.publish_status ?? "draft") as PublishStatus;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/90 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200/80 hover:shadow-[0_20px_48px_-14px_oklch(0.45_0.12_275_/_18%)]">
      {canEdit && (
        <Link
          href={`/courses/${course.slug}/edit`}
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-xl border border-white/40 bg-white/90 text-indigo-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-indigo-900"
          aria-label="Edit course"
        >
          <Pencil className="size-4" />
        </Link>
      )}
    <Link
      href={`/courses/${course.slug}`}
      className="flex flex-1 flex-col"
    >
      <div
        className="relative flex h-36 flex-col justify-between p-4"
        style={{
          background: `linear-gradient(135deg, oklch(0.78 0.1 ${hue}) 0%, oklch(0.58 0.16 ${hue}) 55%, oklch(0.48 0.14 ${hue + 15}) 100%)`,
        }}
      >
        <div className="flex items-start justify-between">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/25 text-white backdrop-blur-sm">
            <Icon className="size-5" strokeWidth={1.75} />
          </span>
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold capitalize backdrop-blur-sm",
              DIFFICULTY_STYLES[course.difficulty] ??
                "border-white/30 bg-white/20 text-white",
            )}
          >
            {getDifficultyLabel(course.difficulty)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[0.65rem] font-semibold text-white backdrop-blur-sm">
            <BookOpen className="size-3" />
            Learn
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[0.65rem] font-semibold text-white backdrop-blur-sm">
            <Layers className="size-3" />
            {flashcardCount}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[0.65rem] font-semibold text-white backdrop-blur-sm">
            <Lightbulb className="size-3" />
            {quizCount}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-[0.65rem] font-medium">
            {getLanguageLabel(course.language)}
          </Badge>
          <Badge variant="outline" className="text-[0.65rem] font-medium capitalize">
            {course.source_type}
          </Badge>
          {publishStatus !== "draft" && (
            <Badge
              variant="outline"
              className={cn(
                "text-[0.65rem] font-medium",
                publishStatus === "pending" && "border-amber-200 bg-amber-50 text-amber-800",
                publishStatus === "approved" &&
                  "border-emerald-200 bg-emerald-50 text-emerald-800",
                publishStatus === "rejected" &&
                  "border-red-200 bg-red-50 text-red-800",
              )}
            >
              {publishStatusLabel(publishStatus)}
            </Badge>
          )}
        </div>

        <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug tracking-tight group-hover:text-primary">
          {course.title}
        </h3>

        {summary && (
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {summary}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/50 pt-4">
          <span className="text-xs text-muted-foreground">
            {formatCourseDate(course.created_at)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
            <Play className="size-3 fill-current" />
            Continue
            <ArrowUpRight className="size-3 opacity-70" />
          </span>
        </div>
      </div>
    </Link>
    </div>
  );
}
