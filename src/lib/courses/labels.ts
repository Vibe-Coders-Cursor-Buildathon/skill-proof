import { DIFFICULTIES, LANGUAGES } from "@/config/constants";
import type { CourseSourceType } from "@/types/course-listing";
import type { Difficulty } from "@/types/course";

export const SOURCE_TYPE_LABELS: Record<CourseSourceType, string> = {
  youtube: "YouTube",
  article: "Article",
  pdf: "PDF",
  audio: "Audio",
};

export function getDifficultyLabel(value: Difficulty): string {
  return DIFFICULTIES.find((d) => d.value === value)?.label ?? value;
}

export function getLanguageLabel(value: string): string {
  return LANGUAGES.find((l) => l.value === value)?.label ?? value.toUpperCase();
}

export function formatCourseDate(iso: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
