import { AnimatedIntro } from "@/components/landing/AnimatedIntro"
import { LandingNavbar } from "@/components/landing/LandingNavbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { MerchantShowcaseSection } from "@/components/landing/MerchantShowcaseSection"
import { StudentFeaturesSection } from "@/components/landing/StudentFeaturesSection"
import { MerchantSection } from "@/components/landing/MerchantSection"
import { AboutUsSection } from "@/components/landing/AboutUsSection"
import { AmbassadorCTASection } from "@/components/landing/AmbassadorCTASection"
import { FAQSection } from "@/components/landing/FAQSection"
import { Footer } from "@/components/landing/Footer"
import { getPublicBrands, getPublicStats } from "@/lib/api-client"

export default async function LandingPage() {
  let brands: any[] = [];
  try {
    const response = await getPublicBrands();
    brands = response.data || [];
  } catch (error) {
    console.error("Error fetching public brands:", error);
  }

  let stats = {
    totalMerchants: 0,
    totalStudents: 0,
    totalRedemptions: 0,
    redemptionsThisMonth: 0,
  };
  try {
    const response = await getPublicStats();
    stats = response.data || stats;
  } catch (error) {
    console.error("Error fetching public stats:", error);
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AnimatedIntro />
      <LandingNavbar />

      {/* 1 — Hook */}
      <HeroSection />

      {/* 2 — Story and traction: who we are, right after the hook */}
      <section id="about" className="scroll-mt-16"><AboutUsSection stats={stats} /></section>

      {/* 3 — Credibility: who already trusts Parchi */}
      <section id="brands" className="scroll-mt-16"><MerchantShowcaseSection brands={brands} /></section>

      {/* 4 — Value for students */}
      <section id="features" className="scroll-mt-16"><StudentFeaturesSection /></section>

      {/* 5 — Value for merchants: pitch, product and CTA in one */}
      <section id="merchants" className="scroll-mt-16"><MerchantSection /></section>

      {/* 6 — Closing CTA: ambassadors (merchants are converted in MerchantSection) */}
      <AmbassadorCTASection />

      {/* 7 — Objection handling, then exit */}
      <section id="faq" className="scroll-mt-16"><FAQSection /></section>
      <Footer />
    </main>
  )
}
