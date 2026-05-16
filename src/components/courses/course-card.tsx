import Link from "next/link";
import { Layers } from "lucide-react";

import { CourseCardThumbnail } from "@/components/courses/course-card-thumbnail";
import { Badge } from "@/components/ui/badge";
import {
  formatCourseDate,
  getDifficultyLabel,
  getLanguageLabel,
} from "@/lib/courses/labels";
import { cn } from "@/lib/utils";
import type { CourseListing } from "@/types/course-listing";

type CourseCardProps = {
  course: CourseListing;
  className?: string;
};

export function CourseCard({ course, className }: CourseCardProps) {
  return (
    <Link
      href={`/course/${course.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-white/90 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_oklch(0.45_0.1_275_/_14%)]",
        className,
      )}
    >
      <CourseCardThumbnail course={course} />

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
