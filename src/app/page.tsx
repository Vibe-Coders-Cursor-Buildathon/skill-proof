import { FeaturesSection } from "@/components/home/features-section";
import { HeroSection } from "@/components/home/hero-section";
import { HomePageClient } from "@/components/home/home-page-client";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { LatestCoursesSection } from "@/components/home/latest-courses-section";
import { PageShell } from "@/components/layout/page-shell";

export default function HomePage() {
  return (
    <PageShell wide>
      <HomePageClient />
      <HeroSection />
      <LatestCoursesSection />
      <FeaturesSection />
      <HowItWorksSection />
    </PageShell>
  );
}
