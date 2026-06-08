import { AnimatedIntro } from "@/components/landing/AnimatedIntro"
import { LandingNavbar } from "@/components/landing/LandingNavbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { MerchantShowcaseSection } from "@/components/landing/MerchantShowcaseSection"
import { StudentFeaturesSection } from "@/components/landing/StudentFeaturesSection"
import { MerchantFeaturesSection } from "@/components/landing/MerchantFeaturesSection"
import { AboutUsSection } from "@/components/landing/AboutUsSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { Footer } from "@/components/landing/Footer"
import { getPublicBrands } from "@/lib/api-client"

export default async function LandingPage() {
  let brands: any[] = [];
  try {
    const response = await getPublicBrands();
    brands = response.data || [];
  } catch (error) {
    console.error("Error fetching public brands:", error);
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AnimatedIntro />
      <LandingNavbar />
      <HeroSection />
      <section id="how-it-works"><HowItWorksSection /></section>
      <section id="brands"><MerchantShowcaseSection brands={brands} /></section>
      <section id="features">
        <StudentFeaturesSection />
        <MerchantFeaturesSection />
      </section>
      <section id="about"><AboutUsSection /></section>
      <section id="faq"><FAQSection /></section>
      <Footer />
    </main>
  )
}
