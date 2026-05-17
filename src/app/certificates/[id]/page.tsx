import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CertificateActions } from "@/components/certificate/certificate-actions";
import { PageShell } from "@/components/layout/page-shell";
import { getUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CertificateRecord } from "@/types/certificate";

export const dynamic = "force-dynamic";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error?.code === "42P01") {
    return (
      <PageShell>
        <p className="text-sm text-muted-foreground">
          Certificates are not enabled yet. Run migration{" "}
          <code className="rounded bg-muted px-1">00015_certificates.sql</code> in
          Supabase.
        </p>
      </PageShell>
    );
  }

  if (!data) {
    notFound();
  }

  const certificate = data as CertificateRecord;
  const isOwner = user?.id === certificate.user_id;

  return (
    <PageShell wide>
      <div className="mx-auto max-w-4xl space-y-8 py-4">
        <Link
          href={isOwner ? "/dashboard?tab=paid" : "/courses"}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {isOwner ? "Back to dashboard" : "Browse courses"}
        </Link>

        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Certificate of completion
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {certificate.learner_name} · {certificate.course_title}
          </p>
        </div>

        <CertificateActions certificate={certificate} />
      </div>
    </PageShell>
  );
}
