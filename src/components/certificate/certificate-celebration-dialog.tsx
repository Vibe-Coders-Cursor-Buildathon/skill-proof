"use client";

import { useMemo, useState } from "react";
import { Award, Check, Copy, Share2 } from "lucide-react";

import { CertificateActions } from "@/components/certificate/certificate-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildLinkedInPostText,
  buildLinkedInShareUrl,
} from "@/lib/certificates/linkedin-post";
import type { CertificateRecord } from "@/types/certificate";

type CertificateCelebrationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate: CertificateRecord;
  courseProgressPercent: number;
  quizScorePercent: number;
};

export function CertificateCelebrationDialog({
  open,
  onOpenChange,
  certificate,
  courseProgressPercent,
  quizScorePercent,
}: CertificateCelebrationDialogProps) {
  const [copied, setCopied] = useState(false);

  const certificatePageUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return `/certificates/${certificate.id}`;
    }
    return `${window.location.origin}/certificates/${certificate.id}`;
  }, [certificate.id]);

  const linkedInText = useMemo(
    () => buildLinkedInPostText(certificate, certificatePageUrl),
    [certificate, certificatePageUrl],
  );

  const copyLinkedInPost = async () => {
    try {
      await navigator.clipboard.writeText(linkedInText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
    }
  };

  const shareOnLinkedIn = () => {
    void copyLinkedInPost();
    window.open(buildLinkedInShareUrl(certificatePageUrl), "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Award className="size-8" />
          </div>
          <DialogTitle className="text-center text-xl">
            Congratulations! 🎉
          </DialogTitle>
          <DialogDescription className="text-center">
            You completed {courseProgressPercent}% of the course and scored{" "}
            {quizScorePercent}% on the quiz. Your verified certificate is ready.
          </DialogDescription>
        </DialogHeader>

        <CertificateActions certificate={certificate} compact />

        <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-4">
          <p className="text-sm font-semibold">Share on LinkedIn</p>
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
            {linkedInText}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl"
              onClick={() => void copyLinkedInPost()}
            >
              {copied ? (
                <Check className="size-4 text-emerald-600" />
              ) : (
                <Copy className="size-4" />
              )}
              {copied ? "Copied" : "Copy post"}
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-2 rounded-xl bg-[#0A66C2] text-white hover:bg-[#004182]"
              onClick={shareOnLinkedIn}
            >
              <Share2 className="size-4" />
              Share on LinkedIn
            </Button>
          </div>
          <p className="text-[0.65rem] text-muted-foreground">
            Opens LinkedIn with your certificate link. Post text is copied to your
            clipboard — paste it into your post.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
