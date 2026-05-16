import { FeaturesSection } from "@/components/home/features-section";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { PricingSection } from "@/components/home/pricing-section";
import { PageShell } from "@/components/layout/page-shell";

export default function HomePage() {
  return (
    <PageShell wide>
      <HeroSection />
      <PricingSection />
      <FeaturesSection />
      <HowItWorksSection />
    </PageShell>
  );
}
