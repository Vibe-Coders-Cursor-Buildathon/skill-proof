import Link from "next/link";
import {
  ArrowUpRight,
  Layers,
  Lightbulb,
  Play,
  ShoppingBag,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatPriceCents } from "@/config/pricing";
import {
  formatCourseDate,
  getDifficultyLabel,
  getLanguageLabel,
} from "@/lib/courses/labels";
import { cn } from "@/lib/utils";
import type { PurchasedCourse } from "@/types/purchased-course";

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

type DashboardPaidCourseCardProps = {
  item: PurchasedCourse;
};

export function DashboardPaidCourseCard({ item }: DashboardPaidCourseCardProps) {
  const { course } = item;
  const hue = SOURCE_HUES[course.source_type] ?? 275;
  const summary = course.content?.summary ?? "";
  const flashcardCount = course.content?.flashcards?.length ?? 0;
  const quizCount = course.content?.quiz?.length ?? 0;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/90 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200/80 hover:shadow-[0_20px_48px_-14px_oklch(0.45_0.12_155_/_18%)]"
    >
      <div
        className="relative flex h-36 flex-col justify-between p-4"
        style={{
          background: `linear-gradient(135deg, oklch(0.78 0.1 ${hue}) 0%, oklch(0.58 0.14 ${hue + 40}) 55%, oklch(0.48 0.12 ${hue + 20}) 100%)`,
        }}
      >
        <div className="flex items-start justify-between">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/25 text-white backdrop-blur-sm">
            <ShoppingBag className="size-5" strokeWidth={1.75} />
          </span>
          <span className="rounded-full border border-white/30 bg-white/20 px-2.5 py-0.5 text-[0.65rem] font-semibold text-white backdrop-blur-sm">
            Purchased
          </span>
        </div>

        <div className="flex items-center gap-2">
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
          <Badge
            variant="outline"
            className={cn(
              "text-[0.65rem] font-medium capitalize",
              DIFFICULTY_STYLES[course.difficulty],
            )}
          >
            {getDifficultyLabel(course.difficulty)}
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

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/50 pt-4">
          <span className="text-xs text-muted-foreground">
            Bought {formatCourseDate(item.purchasedAt)} ·{" "}
            {formatPriceCents(item.purchasePriceCents)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
            <Play className="size-3 fill-current" />
            Open
            <ArrowUpRight className="size-3 opacity-70" />
          </span>
        </div>
      </div>
    </Link>
  );
}
