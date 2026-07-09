import { Background } from "@/components/ui/Background";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Certificates } from "@/components/Certificates";
import { TrustBar } from "@/components/TrustBar";
import { PlatformInside } from "@/components/PlatformInside";
import { HowItWorks } from "@/components/HowItWorks";
import { Guarantee } from "@/components/Guarantee";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
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
        <Certificates />
        <TrustBar />
        <PlatformInside />
        {/* fabricated reviews removed (UX-audit #2) — real ones return when
            real students write them; until then: the honest 3-step story */}
        <HowItWorks />
        <Guarantee />
        <Pricing />
        <FAQ />
        <UGCCreator />
      </main>
      <Footer />
    </>
  );
}
