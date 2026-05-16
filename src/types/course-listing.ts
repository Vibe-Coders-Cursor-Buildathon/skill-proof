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
  thumbnailHue?: number;
};

export type CourseSortOption = "latest" | "oldest" | "title-asc";

export type CourseFilters = {
  query: string;
  sourceTypes: CourseSourceType[];
  difficulties: Difficulty[];
  languages: string[];
  sort: CourseSortOption;
};
