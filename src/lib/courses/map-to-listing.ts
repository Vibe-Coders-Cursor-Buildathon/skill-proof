import { getEffectiveCourseContent } from "@/lib/courses/get-effective-content";
import type { CourseListing, CourseSourceType } from "@/types/course-listing";

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  source_type: string;
  language: string;
  difficulty: string;
  content: unknown;
  content_edited?: unknown | null;
  created_at: string;
  published_at?: string | null;
  profiles?: { display_name: string | null } | null;
};

const SOURCE_HUES: Record<string, number> = {
  youtube: 275,
  pdf: 155,
  article: 220,
  audio: 30,
};

export function mapCourseRowToListing(row: CourseRow): CourseListing | null {
  const effective = getEffectiveCourseContent(row.content, row.content_edited);
  if (!effective) return null;

  const sourceType = row.source_type as CourseSourceType;

  return {
    id: row.id,
    slug: row.slug,
    title: effective.title,
    summary: effective.summary,
    sourceType,
    language: row.language,
    difficulty: row.difficulty as CourseListing["difficulty"],
    conceptCount: effective.concepts.length,
    flashcardCount: effective.flashcards.length,
    quizCount: effective.quiz.length,
    createdAt: row.published_at ?? row.created_at,
    author: row.profiles?.display_name ?? undefined,
    thumbnailHue: SOURCE_HUES[sourceType] ?? 275,
  };
}
