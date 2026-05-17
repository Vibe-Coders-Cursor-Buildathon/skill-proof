"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";
import { Download, ExternalLink, Loader2 } from "lucide-react";

import { CertificateDocument } from "@/components/certificate/certificate-document";
import { Button } from "@/components/ui/button";
import type { CertificateRecord } from "@/types/certificate";

type CertificateActionsProps = {
  certificate: CertificateRecord;
  compact?: boolean;
};

export function CertificateActions({
  certificate,
  compact = false,
}: CertificateActionsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPng = async () => {
    if (!ref.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `${certificate.certificate_number}-certificate.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={compact ? "space-y-4" : "space-y-8"}>
      {!compact ? (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-6">
          <CertificateDocument ref={ref} certificate={certificate} />
        </div>
      ) : (
        <div
          className="pointer-events-none fixed left-[-10000px] top-0 w-[1120px]"
          aria-hidden
        >
          <CertificateDocument ref={ref} certificate={certificate} />
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={() => void downloadPng()}
          disabled={isDownloading}
          className="btn-gradient gap-2 rounded-xl border-0 font-semibold"
        >
          {isDownloading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Download PNG
        </Button>
        <Button
          type="button"
          variant="outline"
          className="gap-2 rounded-xl"
          render={<Link href={`/certificates/${certificate.id}`} target="_blank" />}
        >
          <ExternalLink className="size-4" />
          View full certificate
        </Button>
      </div>
    </div>
  );
}
