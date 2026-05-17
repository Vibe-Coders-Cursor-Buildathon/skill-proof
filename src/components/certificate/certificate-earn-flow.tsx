"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Award, Loader2 } from "lucide-react";

import { CertificateCelebrationDialog } from "@/components/certificate/certificate-celebration-dialog";
import { Button } from "@/components/ui/button";
import {
  CERTIFICATE_MIN_COURSE_PROGRESS_PERCENT,
  CERTIFICATE_PASS_PERCENT,
} from "@/lib/certificates/constants";
import { meetsCertificateCourseProgress } from "@/lib/courses/course-progress";
import type { CertificateRecord } from "@/types/certificate";

type CertificateEarnFlowProps = {
  courseSlug: string;
  courseTitle: string;
  courseProgressPercent: number;
  masteredConcepts: number;
  knownFlashcards: number;
  quizScorePercent: number | null;
  isSignedIn: boolean;
};

export function CertificateEarnFlow({
  courseSlug,
  courseTitle,
  courseProgressPercent,
  masteredConcepts,
  knownFlashcards,
  quizScorePercent,
  isSignedIn,
}: CertificateEarnFlowProps) {
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const popupShownRef = useRef(false);

  const quizPassed =
    quizScorePercent != null && quizScorePercent >= CERTIFICATE_PASS_PERCENT;
  const courseReady = meetsCertificateCourseProgress(courseProgressPercent);
  const canClaim = isSignedIn && quizPassed && courseReady;

  const loadExisting = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const res = await fetch(
        `/api/courses/${encodeURIComponent(courseSlug)}/certificate`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as {
        certificate: CertificateRecord | null;
      };
      if (data.certificate) {
        setCertificate(data.certificate);
      }
    } catch {
      /* ignore */
    }
  }, [courseSlug, isSignedIn]);

  useEffect(() => {
    void loadExisting();
  }, [loadExisting]);

  const claimCertificate = useCallback(async () => {
    if (!canClaim || quizScorePercent == null) return;
    setIsIssuing(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/courses/${encodeURIComponent(courseSlug)}/certificate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quiz_score_percent: quizScorePercent,
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
        throw new Error(data.error ?? "Could not issue certificate");
      }
      if (data.certificate) {
        setCertificate(data.certificate);
        setDialogOpen(true);
        popupShownRef.current = true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not issue certificate");
    } finally {
      setIsIssuing(false);
    }
  }, [
    canClaim,
    courseSlug,
    knownFlashcards,
    masteredConcepts,
    quizScorePercent,
  ]);

  useEffect(() => {
    if (certificate && canClaim && !popupShownRef.current) {
      setDialogOpen(true);
      popupShownRef.current = true;
    }
  }, [certificate, canClaim]);

  useEffect(() => {
    if (canClaim && !certificate && !isIssuing && !popupShownRef.current) {
      popupShownRef.current = true;
      void claimCertificate();
    }
  }, [canClaim, certificate, isIssuing, claimCertificate]);

  if (!isSignedIn) {
    return (
      <div className="mt-6 rounded-2xl border border-indigo-200/80 bg-indigo-50/90 px-4 py-4 text-sm text-indigo-950">
        <p className="font-semibold">Certificate available on this course</p>
        <p className="mt-2">
          Sign in to earn a verified certificate when you complete more than{" "}
          {CERTIFICATE_MIN_COURSE_PROGRESS_PERCENT}% of &quot;{courseTitle}&quot;
          and pass the quiz ({CERTIFICATE_PASS_PERCENT}%+).
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50/90 to-indigo-50/50 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
              <Award className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-violet-950">Course certificate</p>
              <p className="mt-1 text-sm text-violet-900/80">
                {certificate
                  ? "Your certificate is ready — view, download, or share on LinkedIn."
                  : canClaim
                    ? "You qualify! Generating your certificate…"
                    : `Progress ${courseProgressPercent}% · pass the quiz (${CERTIFICATE_PASS_PERCENT}%+) and complete more than ${CERTIFICATE_MIN_COURSE_PROGRESS_PERCENT}% to unlock.`}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {certificate ? (
              <Button
                type="button"
                className="btn-gradient rounded-xl border-0 font-semibold"
                onClick={() => setDialogOpen(true)}
              >
                View certificate
              </Button>
            ) : canClaim ? (
              <Button
                type="button"
                disabled={isIssuing}
                className="btn-gradient gap-2 rounded-xl border-0 font-semibold"
                onClick={() => void claimCertificate()}
              >
                {isIssuing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Get my certificate
              </Button>
            ) : null}
          </div>
        </div>
        {error && (
          <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      {certificate && quizScorePercent != null && (
        <CertificateCelebrationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          certificate={certificate}
          courseProgressPercent={courseProgressPercent}
          quizScorePercent={quizScorePercent}
        />
      )}
    </>
  );
}
