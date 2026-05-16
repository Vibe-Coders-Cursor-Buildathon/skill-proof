"use client";

import Image from "next/image";
import { useState } from "react";
import { FileText, FileUp, Mic, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SOURCE_TYPE_LABELS } from "@/lib/courses/labels";
import type { CourseListing, CourseSourceType } from "@/types/course-listing";

const SOURCE_ICONS: Record<CourseSourceType, typeof Video> = {
  youtube: Video,
  article: FileText,
  pdf: FileUp,
  audio: Mic,
};

const FALLBACK_THUMBNAIL = "/course-thumbnails/default.jpg";

type CourseCardThumbnailProps = {
  course: CourseListing;
};

export function CourseCardThumbnail({ course }: CourseCardThumbnailProps) {
  const SourceIcon = SOURCE_ICONS[course.sourceType];
  const primarySrc =
    course.thumbnailUrl ?? `/course-thumbnails/${course.slug}.jpg`;
  const [src, setSrc] = useState(primarySrc);

  return (
    <div className="relative flex h-36 items-end overflow-hidden bg-muted p-4">
      <Image
        src={src}
        alt={course.thumbnailAlt ?? course.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        onError={() => {
          if (src !== FALLBACK_THUMBNAIL) {
            setSrc(FALLBACK_THUMBNAIL);
          }
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/5"
      />

      <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/25 text-white ring-1 ring-white/30 backdrop-blur-sm">
        <SourceIcon className="size-5" strokeWidth={1.75} />
      </span>
      <Badge
        variant="secondary"
        className="absolute top-3 right-3 z-10 border-0 bg-white/90 text-xs font-medium text-foreground shadow-sm"
      >
        {SOURCE_TYPE_LABELS[course.sourceType]}
      </Badge>
    </div>
  );
}
