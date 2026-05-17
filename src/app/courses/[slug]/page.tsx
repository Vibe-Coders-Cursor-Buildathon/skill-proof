import { notFound } from "next/navigation";

import { CourseStudyView } from "@/components/course/course-study-view";
import { PageShell } from "@/components/layout/page-shell";
import { buildPreviewContent } from "@/lib/courses/build-preview-content";
import { resolveCourseAccess } from "@/lib/courses/course-access";
import { getEffectiveCourseContent } from "@/lib/courses/get-effective-content";
import { getUser } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-guard";
import {
  getMaxPublishedCourses,
  userHasFeature,
} from "@/lib/auth/plan-guard";
import { getCourseCertificateConfig } from "@/lib/certificates/course-certificate-config";
import { countPublishSlotsUsed } from "@/lib/courses/publish-limits";
import type { PublishStatus } from "@/lib/courses/publish-status";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CourseSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ purchased?: string }>;
}) {
  const { slug } = await params;
  const { purchased } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const user = await getUser();
  const userIsAdmin = user ? await isAdmin(user.id) : false;

  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) notFound();

  const effective = getEffectiveCourseContent(data.content, data.content_edited);
  if (!effective) notFound();

  const access = await resolveCourseAccess({
    supabase,
    userId: user?.id ?? null,
    course: data,
    isAdmin: userIsAdmin,
  });

  const displayCourse = access.hasFullAccess
    ? effective
    : buildPreviewContent(effective);

  const isOwner = access.isOwner;
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

  const certConfig = await getCourseCertificateConfig(
    supabase,
    data.id,
    data.slug,
    effective.title,
    data.certificates_enabled === true,
    data.user_id,
  );
  const certificatesEnabled = Boolean(certConfig?.enabled);

  return (
    <PageShell wide>
      <CourseStudyView
        course={displayCourse}
        fullCourse={effective}
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
        currentPriceCents={data.price_cents}
        hasFullAccess={access.hasFullAccess}
        isPaidPublic={access.isPaidPublic}
        priceCents={access.priceCents}
        isSignedIn={Boolean(user)}
        purchaseSuccess={purchased === "1"}
        certificatesEnabled={certificatesEnabled}
      />
    </PageShell>
  );
}
