"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";

export function CreditsPurchaseSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const purchased = searchParams.get("credits_purchased");
  const [visible, setVisible] = useState(Boolean(purchased));

  useEffect(() => {
    setVisible(Boolean(purchased));
  }, [purchased]);

  if (!visible || !purchased) return null;

  const count = Number.parseInt(purchased, 10);
  const label =
    Number.isInteger(count) && count > 1
      ? `${count} credits were added to your account.`
      : "Credits were added to your account.";

  const dismiss = () => {
    setVisible(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("credits_purchased");
    const qs = params.toString();
    router.replace(qs ? `/dashboard?${qs}` : "/dashboard?tab=plan");
  };

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900">
      <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
      <p className="flex-1 font-medium">{label}</p>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded-lg p-1 hover:bg-emerald-100"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
