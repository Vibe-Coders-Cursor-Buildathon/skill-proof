"use client";

import { Award } from "lucide-react";

import { CertificateActions } from "@/components/certificate/certificate-actions";
import { CertificateLinkedInShare } from "@/components/certificate/certificate-linkedin-share";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

        <CertificateLinkedInShare certificate={certificate} />
      </DialogContent>
    </Dialog>
  );
}
