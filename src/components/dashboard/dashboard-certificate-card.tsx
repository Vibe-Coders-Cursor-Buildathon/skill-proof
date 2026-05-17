"use client";

import Link from "next/link";
import { Award, ExternalLink } from "lucide-react";

import { CertificateLinkedInShare } from "@/components/certificate/certificate-linkedin-share";
import { Button } from "@/components/ui/button";
import { formatCourseDate } from "@/lib/courses/labels";
import type { UserCertificate } from "@/types/user-certificate";

type DashboardCertificateCardProps = {
  certificate: UserCertificate;
};

export function DashboardCertificateCard({
  certificate,
}: DashboardCertificateCardProps) {
  const issuedLabel = formatCourseDate(certificate.issued_at);

  return (
    <article className="glass-card overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <Award className="size-6" />
          </span>
          <div>
            <h3 className="text-lg font-bold leading-snug">
              {certificate.course_title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Issued {issuedLabel} · Quiz {certificate.quiz_score_percent}%
            </p>
            {certificate.publisher_brand_name && (
              <p className="mt-1 text-xs text-muted-foreground">
                Partner: {certificate.publisher_brand_name}
              </p>
            )}
            <p className="mt-2 font-mono text-[0.65rem] text-muted-foreground">
              {certificate.certificate_number}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            className="btn-gradient rounded-xl border-0 font-semibold"
            render={
              <Link href={`/certificates/${certificate.id}`} target="_blank" />
            }
          >
            <ExternalLink className="size-4" />
            View certificate
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl font-semibold"
            render={<Link href={`/courses/${certificate.course_slug}`} />}
          >
            Open course
          </Button>
        </div>
      </div>

      <CertificateLinkedInShare certificate={certificate} />
    </article>
  );
}
