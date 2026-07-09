import { Background } from "@/components/ui/Background";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { HowItWorks } from "@/components/HowItWorks";
import { PlatformInside } from "@/components/PlatformInside";
import { Certificates } from "@/components/Certificates";
import { Guarantee } from "@/components/Guarantee";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { UGCCreator } from "@/components/UGCCreator";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";

/*
 * Landing narrative (value before proof, honest throughout):
 * promise → honest facts strip → how it works → what's inside →
 * real school results → pricing → guarantee → FAQ → UGC → final CTA.
 * Fabricated reviews/counters stay out until real students produce real ones.
 */
export default function Home() {
  return (
    <>
      <Background />
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <HowItWorks />
        <PlatformInside />
        <Certificates />
        <Pricing />
        <Guarantee />
        <FAQ />
        <UGCCreator />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
