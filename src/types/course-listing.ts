import type { Difficulty } from "@/types/course";

export type CourseSourceType = "youtube" | "pdf" | "article" | "audio";

export type CourseListing = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  sourceType: CourseSourceType;
  language: string;
  difficulty: Difficulty;
  conceptCount: number;
  flashcardCount: number;
  quizCount: number;
  createdAt: string;
  author?: string;
  /** Fallback gradient tint when no thumbnailUrl */
  thumbnailHue?: number;
  /** Cover image for catalog cards (e.g. Unsplash or stored URL) */
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  /** List price in USD cents; null = free */
  priceCents?: number | null;
};

export type CourseSortOption = "latest" | "oldest" | "title-asc";

export type CourseFilters = {
  query: string;
  sourceTypes: CourseSourceType[];
  difficulties: Difficulty[];
  languages: string[];
  sort: CourseSortOption;
};
