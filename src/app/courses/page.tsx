import { CoursesCatalog } from "@/components/courses/courses-catalog";
import { PageShell } from "@/components/layout/page-shell";
import { getPublicCourses } from "@/lib/courses/get-public-courses";

export const metadata = {
  title: "Courses | SkillProof",
  description:
    "Browse public micro-courses created from YouTube, PDFs, articles, and audio.",
};

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await getPublicCourses();

  return (
    <PageShell wide>
      <div className="pb-16 pt-4 md:pb-24 md:pt-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Course library
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl md:text-[2.75rem]">
            Explore public courses
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Filter by source, difficulty, and language. Every course includes
            flashcards, quizzes, and a certificate path. Only admin-approved
            courses appear here.
          </p>
        </div>

        <div className="mt-12">
          <CoursesCatalog initialCourses={courses} />
        </div>
      </div>
    </PageShell>
  );
}
