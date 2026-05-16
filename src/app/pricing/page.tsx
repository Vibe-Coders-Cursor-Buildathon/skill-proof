import { PricingSection } from "@/components/home/pricing-section";
import { PageShell } from "@/components/layout/page-shell";

export const metadata = {
  title: "Pricing | SkillProof",
  description:
    "Compare SkillProof plans — Free, Individual ($10/mo), Business ($20/mo), and Enterprise ($35/mo).",
};

export default function PricingPage() {
  return (
    <PageShell wide>
      <div className="pb-16 pt-4 md:pb-24 md:pt-8">
        <PricingSection className="py-6 md:py-10" />
      </div>
    </PageShell>
  );
}
