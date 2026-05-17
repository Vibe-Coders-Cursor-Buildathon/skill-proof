import type { CertificateRecord } from "@/types/certificate";

export type UserCertificate = CertificateRecord & {
  course_slug: string;
};
