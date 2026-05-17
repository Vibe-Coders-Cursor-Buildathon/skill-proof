"use client";

import { useEffect, useRef, useState } from "react";
import { Award, Loader2 } from "lucide-react";

import { CertificateActions } from "@/components/certificate/certificate-actions";
import { CERTIFICATE_PASS_PERCENT } from "@/lib/certificates/constants";
import { getQuizPassForCourse } from "@/lib/certificates/quiz-pass-storage";
import { meetsCertificateCourseProgress } from "@/lib/courses/course-progress";
import type { CertificateRecord } from "@/types/certificate";

type CertificateCourseProgressProps = {
  courseSlug: string;
  courseProgressPercent: number;
  masteredConcepts: number;
  knownFlashcards: number;
  isSignedIn: boolean;
};

export function CertificateCourseProgress({
  courseSlug,
  courseProgressPercent,
  masteredConcepts,
  knownFlashcards,
  isSignedIn,
}: CertificateCourseProgressProps) {
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const issueAttempted = useRef(false);

  const quizScore = getQuizPassForCourse(courseSlug);
  const quizPassed =
    quizScore != null && quizScore >= CERTIFICATE_PASS_PERCENT;
  const courseReady = meetsCertificateCourseProgress(courseProgressPercent);
  const canRequest = isSignedIn && quizPassed && courseReady;

  useEffect(() => {
    if (!canRequest) {
      issueAttempted.current = false;
      return;
    }
    if (issueAttempted.current) {
      return;
    }

    issueAttempted.current = true;
    let cancelled = false;

    const issue = async () => {
      setIsIssuing(true);
      setError(null);
      try {
        const existingRes = await fetch(
          `/api/courses/${encodeURIComponent(courseSlug)}/certificate`,
        );
        if (existingRes.ok) {
          const existingData = (await existingRes.json()) as {
            certificate: CertificateRecord | null;
          };
          if (existingData.certificate && !cancelled) {
            setCertificate(existingData.certificate);
            return;
          }
        }

        const res = await fetch(
          `/api/courses/${encodeURIComponent(courseSlug)}/certificate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quiz_score_percent: quizScore,
              mastered_concepts: masteredConcepts,
              known_flashcards: knownFlashcards,
            }),
          },
        );
        const data = (await res.json()) as {
          error?: string;
          certificate?: CertificateRecord;
        };
        if (!res.ok) {
          if (res.status === 400 && data.error?.includes("does not offer")) {
            return;
          }
          throw new Error(data.error ?? "Could not issue certificate");
        }
        if (data.certificate && !cancelled) {
          setCertificate(data.certificate);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not issue certificate",
          );
        }
      } finally {
        if (!cancelled) {
          setIsIssuing(false);
        }
      }
    };

    void issue();
    return () => {
      cancelled = true;
    };
  }, [
    canRequest,
    courseSlug,
    knownFlashcards,
    masteredConcepts,
    quizScore,
  ]);

  if (!courseReady || !quizPassed) {
    return null;
  }

  if (isIssuing && !certificate) {
    return (
      <div className="mb-6 flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-muted/30 px-4 py-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Generating your certificate…
      </div>
    );
  }

  if (error) {
    return (
      <p className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (certificate) {
    return (
      <div className="mb-6 space-y-4 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-orange-50/50 p-5">
        <div className="flex items-center gap-3">
          <Award className="size-7 text-amber-600" />
          <div>
            <p className="font-bold text-amber-950">Certificate ready</p>
            <p className="mt-1 text-sm text-amber-900/80">
              Course progress {courseProgressPercent}% — download your
              certificate below.
            </p>
          </div>
        </div>
        <CertificateActions certificate={certificate} compact />
      </div>
    );
  }

  return null;
}
