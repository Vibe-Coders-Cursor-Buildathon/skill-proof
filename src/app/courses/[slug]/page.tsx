import { notFound } from "next/navigation";

import { CourseStudyView } from "@/components/course/course-study-view";
import { PageShell } from "@/components/layout/page-shell";
import { getEffectiveCourseContent } from "@/lib/courses/get-effective-content";
import { getUser } from "@/lib/auth/session";
import {
  getMaxPublishedCourses,
  userHasFeature,
} from "@/lib/auth/plan-guard";
import { countPublishSlotsUsed } from "@/lib/courses/publish-limits";
import type { PublishStatus } from "@/lib/courses/publish-status";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CourseSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const user = await getUser();

  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) notFound();

  const effective = getEffectiveCourseContent(data.content, data.content_edited);
  if (!effective) notFound();

  const isOwner = Boolean(user && data.user_id === user.id);
  const canEdit =
    isOwner && user
      ? await userHasFeature(user.id, "can_edit_course")
      : false;
  const canPublish =
    isOwner && user
      ? await userHasFeature(user.id, "can_publish_course")
      : false;

  const publishStatus = (data.publish_status ?? "draft") as PublishStatus;
  let publishSlotsUsed = 0;
  let publishSlotsMax = 0;
  if (canPublish && user) {
    publishSlotsMax = await getMaxPublishedCourses(user.id);
    publishSlotsUsed = await countPublishSlotsUsed(supabase, user.id);
  }

  return (
    <PageShell wide>
      <CourseStudyView
        course={effective}
        meta={{
          slug: data.slug,
          difficulty: data.difficulty as string,
          language: data.language,
          sourceType: data.source_type as string,
        }}
        canEdit={canEdit}
        hasEditedVersion={data.content_edited != null}
        canPublish={canPublish}
        publishStatus={publishStatus}
        publishSlotsUsed={publishSlotsUsed}
        publishSlotsMax={publishSlotsMax}
        publishRejectionReason={data.publish_rejection_reason}
      />
    </PageShell>
  );
}
