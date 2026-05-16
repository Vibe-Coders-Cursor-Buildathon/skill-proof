import { courseContentSchema, type CourseContent } from "@/types/course";

/** Prefer learner-edited JSON when present; otherwise AI-generated content. */
export function getEffectiveCourseContent(
  content: unknown,
  contentEdited: unknown | null | undefined,
): CourseContent | null {
  if (contentEdited != null) {
    const edited = courseContentSchema.safeParse(contentEdited);
    if (edited.success) return edited.data;
  }

  const base = courseContentSchema.safeParse(content);
  return base.success ? base.data : null;
}
