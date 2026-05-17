"use client";

import { useCallback, useEffect, useState } from "react";
import { Award, ImageIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BrandingState = {
  certificate_brand_name: string | null;
  certificate_logo_url: string | null;
  organization_name: string | null;
  display_name: string | null;
};

export function CertificateBrandingSection() {
  const [branding, setBranding] = useState<BrandingState | null>(null);
  const [brandName, setBrandName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadBranding = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/certificate-branding");
      if (res.status === 403) {
        setBranding(null);
        return;
      }
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to load branding");
      }
      const data = (await res.json()) as { branding: BrandingState };
      setBranding(data.branding);
      setBrandName(data.branding.certificate_brand_name ?? "");
      setLogoUrl(data.branding.certificate_logo_url ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load branding");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBranding();
  }, [loadBranding]);

  const save = async () => {
    setError(null);
    setMessage(null);
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile/certificate-branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificate_brand_name: brandName,
          certificate_logo_url: logoUrl,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        branding?: BrandingState;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to save branding");
      }
      if (data.branding) {
        setBranding(data.branding);
      }
      setMessage(
        "Certificate branding saved. It appears on certificates for your published courses.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading certificate settings…
      </div>
    );
  }

  if (!branding) {
    return null;
  }

  const suggestedName =
    branding.organization_name?.trim() ||
    branding.display_name?.trim() ||
    "";

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <Award className="size-6" />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Certificates
          </p>
          <h3 className="mt-1 text-xl font-bold">Your logo on learner certificates</h3>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            When learners complete your published courses with a passing quiz score
            (70%+), SkillProof issues a certificate with your organization name and
            logo alongside the learner&apos;s name and course title.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="cert-brand-name"
            className="text-sm font-semibold"
          >
            Organization name
          </label>
          <Input
            id="cert-brand-name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder={suggestedName || "Your company or school"}
            maxLength={120}
            className="rounded-xl"
          />
          <p className="text-xs text-muted-foreground">
            Shown as &quot;Issued in partnership with …&quot; on certificates.
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="cert-logo-url" className="text-sm font-semibold">
            Logo URL
          </label>
          <Input
            id="cert-logo-url"
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="rounded-xl"
          />
          <p className="text-xs text-muted-foreground">
            Public HTTPS image (PNG or SVG recommended). Shown in the top-right of
            each certificate.
          </p>
        </div>
      </div>

      {logoUrl.trim() && (
        <div className="mt-5 flex items-center gap-4 rounded-xl border border-border/60 bg-white/60 px-4 py-3">
          <ImageIcon className="size-5 shrink-0 text-muted-foreground" />
          <img
            src={logoUrl.trim()}
            alt="Certificate logo preview"
            className="h-12 max-w-[160px] object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="text-xs text-muted-foreground">Preview</span>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-3 py-2 text-sm text-emerald-900">
          {message}
        </p>
      )}

      <Button
        type="button"
        onClick={() => void save()}
        disabled={isSaving}
        className="btn-gradient mt-5 gap-2 rounded-xl border-0 font-semibold"
      >
        {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
        Save certificate branding
      </Button>
    </div>
  );
}
