import { Background } from "@/components/ui/Background";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Certificates } from "@/components/Certificates";
import { TrustBar } from "@/components/TrustBar";
import { PlatformInside } from "@/components/PlatformInside";
import { Reviews } from "@/components/Reviews";
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
        <Reviews />
        <Guarantee />
        <Pricing />
        <FAQ />
        <UGCCreator />
      </main>
      <Footer />
    </>
  );
}
