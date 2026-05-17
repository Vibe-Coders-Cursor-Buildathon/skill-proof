"use client";

import Link from "next/link";
import { Award, BookOpen } from "lucide-react";

import { DashboardCertificateCard } from "@/components/dashboard/dashboard-certificate-card";
import { Button } from "@/components/ui/button";
import {
  CERTIFICATE_MIN_COURSE_PROGRESS_PERCENT,
  CERTIFICATE_PASS_PERCENT,
} from "@/lib/certificates/constants";
import type { UserCertificate } from "@/types/user-certificate";

type DashboardCertificatesSectionProps = {
  certificates: UserCertificate[];
};

export function DashboardCertificatesSection({
  certificates,
}: DashboardCertificatesSectionProps) {
  return (
    <section>
      <p className="mb-6 text-sm text-muted-foreground">
        {certificates.length === 0
          ? "Certificates you earn from published courses appear here with a share-ready LinkedIn post."
          : `${certificates.length} certificate${certificates.length !== 1 ? "s" : ""} — download, view, or share on LinkedIn.`}
      </p>

      {certificates.length === 0 ? (
        <div className="glass-card flex flex-col items-center px-6 py-14 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <Award className="size-8" />
          </span>
          <h3 className="mt-5 text-lg font-bold">No certificates yet</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Enroll in a published course from the catalog, complete more than{" "}
            {CERTIFICATE_MIN_COURSE_PROGRESS_PERCENT}% (learn + flashcards + quiz),
            and pass the quiz with {CERTIFICATE_PASS_PERCENT}% or higher. Your
            certificate will show up here automatically.
          </p>
          <Button
            type="button"
            className="btn-gradient mt-6 gap-2 rounded-xl border-0 font-semibold"
            render={<Link href="/courses" />}
          >
            <BookOpen className="size-4" />
            Browse courses
          </Button>
        </div>
      ) : (
        <ul className="space-y-5">
          {certificates.map((certificate) => (
            <li key={certificate.id}>
              <DashboardCertificateCard certificate={certificate} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
