import type { SupabaseClient } from "@supabase/supabase-js";

import type { CourseCertificateConfig } from "@/types/certificate";

export async function getCourseCertificateConfig(
  supabase: SupabaseClient,
  courseId: string,
  courseSlug: string,
  courseTitle: string,
  certificatesEnabled: boolean,
  ownerUserId: string | null,
  isPublished = false,
  publishStatus: string | null = null,
): Promise<CourseCertificateConfig | null> {
  const publishedLive =
    isPublished &&
    (publishStatus === "approved" || publishStatus === null);

  if ((!certificatesEnabled && !publishedLive) || !ownerUserId) {
    return null;
  }

  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select(
      "id, display_name, organization_name, certificate_brand_name, certificate_logo_url, plans(features)",
    )
    .eq("id", ownerUserId)
    .single();

  if (!ownerProfile) {
    return null;
  }

  const plans = ownerProfile.plans as { features?: Record<string, boolean> } | null;
  const features = plans?.features;
  const canIssue = features?.can_issue_certificate === true;
  const canPublish = features?.can_publish_course === true;

  if (!canIssue || !canPublish) {
    return null;
  }

  const publisherBrandName =
    ownerProfile.certificate_brand_name?.trim() ||
    ownerProfile.organization_name?.trim() ||
    ownerProfile.display_name?.trim() ||
    null;

  return {
    enabled: true,
    courseId,
    courseSlug,
    courseTitle,
    publisherBrandName,
    publisherLogoUrl: ownerProfile.certificate_logo_url ?? null,
  };
}
