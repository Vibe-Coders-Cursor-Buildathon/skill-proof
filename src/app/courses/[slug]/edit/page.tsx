import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CourseEditor } from "@/components/course/course-editor";
import { PageShell } from "@/components/layout/page-shell";
import { getEffectiveCourseContent } from "@/lib/courses/get-effective-content";
import { getUser } from "@/lib/auth/session";
import { userHasFeature } from "@/lib/auth/plan-guard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Edit course | SkillProof",
};

export default async function CourseEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/?auth=signin");
  }

  const canEdit = await userHasFeature(user.id, "can_edit_course");
  if (!canEdit) {
    return (
      <PageShell wide>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Editing not available</h1>
          <p className="mt-3 text-muted-foreground">
            Upgrade to the Business plan (or higher) to edit AI-generated course
            content, flashcards, and quiz questions.
          </p>
          <Link
            href="/pricing"
            className="btn-gradient mt-6 inline-flex rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
          >
            View plans
          </Link>
        </div>
      </PageShell>
    );
  }

  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("courses")
    .select("id, slug, user_id, content, content_edited")
    .eq("slug", slug)
    .single();

  if (!data) notFound();

  if (data.user_id !== user.id) {
    redirect(`/courses/${slug}`);
  }

  const effective = getEffectiveCourseContent(data.content, data.content_edited);
  if (!effective) notFound();

  return (
    <PageShell wide>
      <CourseEditor slug={slug} initialContent={effective} />
    </PageShell>
  );
}
