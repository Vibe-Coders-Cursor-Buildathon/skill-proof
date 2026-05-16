import { notFound } from "next/navigation";

import { CourseStudyView } from "@/components/course/course-study-view";
import { PageShell } from "@/components/layout/page-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { courseContentSchema } from "@/types/course";

export const dynamic = "force-dynamic";

export default async function CourseSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) notFound();

  const parsed = courseContentSchema.safeParse(data.content);
  if (!parsed.success) notFound();

  return (
    <PageShell wide>
      <CourseStudyView
        course={parsed.data}
        meta={{
          slug: data.slug,
          difficulty: data.difficulty as string,
          language: data.language,
          sourceType: data.source_type as string,
        }}
      />
    </PageShell>
  );
}
