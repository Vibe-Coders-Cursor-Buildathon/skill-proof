import {
  PREVIEW_CONCEPT_COUNT,
  PREVIEW_FLASHCARD_COUNT,
  PREVIEW_QUIZ_COUNT,
} from "@/config/course-pricing";
import type { CourseContent } from "@/types/course";

/** First concept, flashcard, and quiz question for unpaid visitors. */
export function buildPreviewContent(course: CourseContent): CourseContent {
  return {
    ...course,
    concepts: course.concepts.slice(0, PREVIEW_CONCEPT_COUNT),
    flashcards: course.flashcards.slice(0, PREVIEW_FLASHCARD_COUNT),
    quiz: course.quiz.slice(0, PREVIEW_QUIZ_COUNT),
  };
}

export function getPreviewTotals(course: CourseContent) {
  return {
    concepts: course.concepts.length,
    flashcards: course.flashcards.length,
    quiz: course.quiz.length,
  };
}
