"use client";

import { forwardRef } from "react";
import { Award, GraduationCap } from "lucide-react";

import { formatCourseDate } from "@/lib/courses/labels";
import type { CertificateRecord } from "@/types/certificate";

type CertificateDocumentProps = {
  certificate: CertificateRecord;
  className?: string;
};

export const CertificateDocument = forwardRef<
  HTMLDivElement,
  CertificateDocumentProps
>(function CertificateDocument({ certificate, className }, ref) {
  const issuedLabel = formatCourseDate(certificate.issued_at);

  return (
    <div
      ref={ref}
      className={
        className ??
        "relative mx-auto aspect-[1.414/1] w-full max-w-3xl overflow-hidden rounded-sm bg-white text-slate-900 shadow-2xl"
      }
      style={{
        background:
          "linear-gradient(165deg, #ffffff 0%, #f8f7ff 45%, #f0f4ff 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-4 rounded-sm border-2 border-indigo-200/80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-6 rounded-sm border border-violet-200/60"
        aria-hidden
      />

      <div className="relative flex h-full flex-col px-10 py-12 sm:px-14 sm:py-16">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg">
              <GraduationCap className="size-7" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                {certificate.platform_name}
              </p>
              <p className="text-[0.65rem] text-muted-foreground">
                Verified micro-course completion
              </p>
            </div>
          </div>
          {certificate.publisher_logo_url && (
            <img
              src={certificate.publisher_logo_url}
              alt=""
              className="h-14 max-w-[140px] object-contain"
            />
          )}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <Award className="size-14 text-amber-500" strokeWidth={1.25} />
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-700">
            Certificate of Completion
          </p>
          <p className="mt-6 text-sm text-slate-600">
            This certifies that
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {certificate.learner_name}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-600">
            has successfully completed the course
          </p>
          <p className="mt-3 text-2xl font-bold text-indigo-800 sm:text-3xl">
            {certificate.course_title}
          </p>
          <p className="mt-6 text-sm text-slate-500">
            Quiz score:{" "}
            <strong className="text-slate-800">
              {certificate.quiz_score_percent}%
            </strong>
          </p>
          {certificate.publisher_brand_name && (
            <p className="mt-4 text-sm text-slate-500">
              Issued in partnership with{" "}
              <strong className="text-slate-800">
                {certificate.publisher_brand_name}
              </strong>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-indigo-100 pt-6 text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-700">Certificate ID</p>
            <p className="mt-1 font-mono">{certificate.certificate_number}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-700">Date issued</p>
            <p className="mt-1">{issuedLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
});
