import type { Metadata } from "next"
import { LandingNavbar } from "@/components/landing/LandingNavbar"
import { Footer } from "@/components/landing/Footer"
import { MerchantApplication } from "@/components/apply/MerchantApplication"

export const metadata: Metadata = {
    title: "Become a Merchant | Parchi",
    description:
        "Partner with Parchi and put your brand in front of Karachi's verified student market. Apply in two minutes.",
}

export default function BecomeAMerchantPage() {
    return (
        <main className="flex min-h-screen flex-col">
            <LandingNavbar navDelay={0} />
            <MerchantApplication />
            <Footer />
        </main>
    )
}
