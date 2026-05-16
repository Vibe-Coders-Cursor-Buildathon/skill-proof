import type {
  CourseFilters,
  CourseListing,
  CourseSortOption,
} from "@/types/course-listing";

export const DEFAULT_COURSE_FILTERS: CourseFilters = {
  query: "",
  sourceTypes: [],
  difficulties: [],
  languages: [],
  sort: "latest",
};

export function filterAndSortCourses(
  courses: CourseListing[],
  filters: CourseFilters,
): CourseListing[] {
  let result = [...courses];

  if (filters.query.trim()) {
    const q = filters.query.trim().toLowerCase();
    result = result.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q),
    );
  }

  if (filters.sourceTypes.length > 0) {
    result = result.filter((c) => filters.sourceTypes.includes(c.sourceType));
  }

  if (filters.difficulties.length > 0) {
    result = result.filter((c) => filters.difficulties.includes(c.difficulty));
  }

  if (filters.languages.length > 0) {
    result = result.filter((c) => filters.languages.includes(c.language));
  }

  result.sort((a, b) => compareCourses(a, b, filters.sort));

  return result;
}

function compareCourses(
  a: CourseListing,
  b: CourseListing,
  sort: CourseSortOption,
): number {
  switch (sort) {
    case "oldest":
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    case "title-asc":
      return a.title.localeCompare(b.title);
    case "latest":
    default:
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }
}

export function getLatestCourses(
  courses: CourseListing[],
  limit = 6,
): CourseListing[] {
  return filterAndSortCourses(courses, { ...DEFAULT_COURSE_FILTERS, sort: "latest" }).slice(
    0,
    limit,
  );
}

export function countActiveFilters(filters: CourseFilters): number {
  let n = 0;
  if (filters.query.trim()) n++;
  if (filters.sourceTypes.length) n++;
  if (filters.difficulties.length) n++;
  if (filters.languages.length) n++;
  return n;
}
