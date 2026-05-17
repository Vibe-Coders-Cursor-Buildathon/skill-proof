import { nanoid } from "nanoid";

import { CERTIFICATE_PASS_PERCENT, PLATFORM_NAME } from "@/lib/certificates/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { CertificateRecord } from "@/types/certificate";

type IssueCertificateParams = {
  userId: string;
  learnerName: string;
  courseId: string;
  courseTitle: string;
  quizScorePercent: number;
  publisherUserId: string | null;
  publisherBrandName: string | null;
  publisherLogoUrl: string | null;
};

export async function issueCertificate(
  params: IssueCertificateParams,
): Promise<{ certificate: CertificateRecord; created: boolean }> {
  if (params.quizScorePercent < CERTIFICATE_PASS_PERCENT) {
    throw new Error(
      `A score of at least ${CERTIFICATE_PASS_PERCENT}% is required for a certificate.`,
    );
  }

  const admin = getSupabaseAdminClient();

  const { data: existing } = await admin
    .from("certificates")
    .select("*")
    .eq("user_id", params.userId)
    .eq("course_id", params.courseId)
    .maybeSingle();

  if (existing) {
    return { certificate: existing as CertificateRecord, created: false };
  }

  const certificateNumber = `SP-${nanoid(10).toUpperCase()}`;

  const { data, error } = await admin
    .from("certificates")
    .insert({
      certificate_number: certificateNumber,
      user_id: params.userId,
      course_id: params.courseId,
      learner_name: params.learnerName,
      course_title: params.courseTitle,
      quiz_score_percent: params.quizScorePercent,
      publisher_user_id: params.publisherUserId,
      publisher_brand_name: params.publisherBrandName,
      publisher_logo_url: params.publisherLogoUrl,
      platform_name: PLATFORM_NAME,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: race } = await admin
        .from("certificates")
        .select("*")
        .eq("user_id", params.userId)
        .eq("course_id", params.courseId)
        .single();
      if (race) {
        return { certificate: race as CertificateRecord, created: false };
      }
    }
    throw error;
  }

  return { certificate: data as CertificateRecord, created: true };
}
