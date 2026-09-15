import type { Metadata } from "next"
import { LandingNavbar } from "@/components/landing/LandingNavbar"
import { Footer } from "@/components/landing/Footer"
import { AmbassadorApplication } from "@/components/apply/AmbassadorApplication"

export const metadata: Metadata = {
    title: "Become a Campus Ambassador | Parchi",
    description:
        "Run Parchi on your campus. Grow the student network where you study, build real marketing experience, and get rewarded for it.",
}

export default function CampusAmbassadorPage() {
    return (
        <main className="flex min-h-screen flex-col">
            <LandingNavbar navDelay={0} />
            <AmbassadorApplication />
            <Footer />
        </main>
    )
}
