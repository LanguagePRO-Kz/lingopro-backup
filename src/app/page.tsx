import { Background } from "@/components/ui/Background";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { ProductShowcase } from "@/components/ProductShowcase";
import { PlatformInside } from "@/components/PlatformInside";
import { ExamsStrip } from "@/components/ExamsStrip";
import { HowItWorks } from "@/components/HowItWorks";
import { Features } from "@/components/Features";
import { PlanSection } from "@/components/PlanSection";
import { Leaderboard } from "@/components/Leaderboard";
import { Gamification } from "@/components/Gamification";
import { DashboardPreview } from "@/components/DashboardPreview";
import { UGCStrip } from "@/components/UGCStrip";
import { Certificates } from "@/components/Certificates";
import { Reviews } from "@/components/Reviews";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { UGCCreator } from "@/components/UGCCreator";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Background />
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <ProductShowcase />
        <HowItWorks />
        <PlatformInside />
        <PlanSection />
        <DashboardPreview />
        <Features />
        <UGCStrip />
        <Certificates />
        <Leaderboard />
        <Gamification />
        <ExamsStrip />
        <Reviews />
        <Pricing />
        <FAQ />
        <FinalCTA />
        <UGCCreator />
      </main>
      <Footer />
    </>
  );
}
