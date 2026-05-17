import { PLATFORM_NAME } from "@/lib/certificates/constants";
import type { CertificateRecord } from "@/types/certificate";

export function buildLinkedInPostText(
  certificate: CertificateRecord,
  certificatePageUrl: string,
): string {
  const brand = certificate.publisher_brand_name;
  const partnerLine = brand
    ? `Completed through ${brand}'s program on ${PLATFORM_NAME}.`
    : `Completed on ${PLATFORM_NAME}.`;

  return [
    `🎓 I just earned a verified certificate for completing "${certificate.course_title}"!`,
    "",
    `Quiz score: ${certificate.quiz_score_percent}%`,
    partnerLine,
    "",
    `View my certificate: ${certificatePageUrl}`,
    "",
    "#Learning #ProfessionalDevelopment #Certificate #SkillProof",
  ].join("\n");
}

export function buildLinkedInShareUrl(certificatePageUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificatePageUrl)}`;
}
