import Link from "next/link";
import { FileText, FileUp, Layers, Mic, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  formatCourseDate,
  getDifficultyLabel,
  getLanguageLabel,
  SOURCE_TYPE_LABELS,
} from "@/lib/courses/labels";
import { cn } from "@/lib/utils";
import type { CourseListing, CourseSourceType } from "@/types/course-listing";

const SOURCE_ICONS: Record<CourseSourceType, typeof Video> = {
  youtube: Video,
  article: FileText,
  pdf: FileUp,
  audio: Mic,
};

type CourseCardProps = {
  course: CourseListing;
  className?: string;
};

export function CourseCard({ course, className }: CourseCardProps) {
  const SourceIcon = SOURCE_ICONS[course.sourceType];
  const hue = course.thumbnailHue ?? 275;

  return (
    <Link
      href={`/course/${course.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-white/90 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_oklch(0.45_0.1_275_/_14%)]",
        className,
      )}
    >
      {/* Thumbnail */}
      <div
        className="relative flex h-36 items-end p-4"
        style={{
          background: `linear-gradient(135deg, oklch(0.75 0.12 ${hue}) 0%, oklch(0.55 0.18 ${hue}) 50%, oklch(0.45 0.15 ${hue + 20}) 100%)`,
        }}
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
          <SourceIcon className="size-5" strokeWidth={1.75} />
        </span>
        <Badge
          variant="secondary"
          className="absolute top-3 right-3 border-0 bg-white/90 text-xs font-medium text-foreground shadow-sm"
        >
          {SOURCE_TYPE_LABELS[course.sourceType]}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-[0.65rem] font-medium">
            {getDifficultyLabel(course.difficulty)}
          </Badge>
          <Badge variant="outline" className="text-[0.65rem] font-medium">
            {getLanguageLabel(course.language)}
          </Badge>
        </div>

        <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug tracking-tight group-hover:text-primary">
          {course.title}
        </h3>

        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {course.summary}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Layers className="size-3.5" />
            {course.conceptCount} concepts · {course.flashcardCount} cards
          </span>
          <span>{formatCourseDate(course.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
