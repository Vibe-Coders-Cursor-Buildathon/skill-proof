export type CertificateRecord = {
  id: string;
  certificate_number: string;
  user_id: string;
  course_id: string;
  learner_name: string;
  course_title: string;
  quiz_score_percent: number;
  publisher_brand_name: string | null;
  publisher_logo_url: string | null;
  platform_name: string;
  issued_at: string;
};

export type CourseCertificateConfig = {
  enabled: boolean;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  publisherBrandName: string | null;
  publisherLogoUrl: string | null;
};
