"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  buildLinkedInPostText,
  buildLinkedInShareUrl,
} from "@/lib/certificates/linkedin-post";
import type { CertificateRecord } from "@/types/certificate";

type CertificateLinkedInShareProps = {
  certificate: CertificateRecord;
  compact?: boolean;
};

export function CertificateLinkedInShare({
  certificate,
  compact = false,
}: CertificateLinkedInShareProps) {
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
      /* ignore */
    }
  };

  const shareOnLinkedIn = () => {
    void copyLinkedInPost();
    window.open(buildLinkedInShareUrl(certificatePageUrl), "_blank", "noopener,noreferrer");
  };

  return (
    <div className={compact ? "space-y-2" : "space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4"}>
      {!compact && (
        <p className="text-sm font-semibold">LinkedIn post</p>
      )}
      <p
        className={
          compact
            ? "line-clamp-4 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground"
            : "whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground"
        }
      >
        {linkedInText}
      </p>
      <div className="flex flex-wrap gap-2">
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
          {copied ? "Copied" : "Copy description"}
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
    </div>
  );
}
