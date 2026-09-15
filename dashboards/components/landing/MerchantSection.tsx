import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity, BarChart3, ShieldCheck, Store } from "lucide-react"

// One merchant story: pitch, product and CTA in a single section.
// (Previously split across MerchantFeaturesSection + PartnerDashboardSection,
// which sold the same audience twice under two different names.)
const FEATURES = [
    {
        icon: Store,
        title: "Corporate & Branch Management",
        desc: "Centralized control for franchises. Assign managers to specific branches with custom access levels.",
    },
    {
        icon: Activity,
        title: "Live Redemption Feed",
        desc: "Every scan lands in your dashboard the moment it happens — branch, offer and student included.",
    },
    {
        icon: BarChart3,
        title: "Real-time Analytics",
        desc: "Know exactly how many students visited, what they redeemed, and your ROI.",
    },
    {
        icon: ShieldCheck,
        title: "Secure Verification",
        desc: "Zero fraud. Our closed-loop system ensures only verified active students can redeem offers.",
    },
]

export function MerchantSection() {
    return (
        <section className="w-full overflow-hidden border-t bg-background py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

                    {/* Left: the real dashboard */}
                    <div className="order-2 lg:order-1">
                        <div className="relative mx-auto w-full max-w-[620px]">
                            <div
                                className="pointer-events-none absolute -inset-5 -z-0 rounded-[28px] opacity-70 blur-2xl"
                                style={{ background: "radial-gradient(55% 55% at 50% 45%, rgba(0,122,255,0.16), transparent 70%)" }}
                            />

                            <div className="relative z-10 overflow-hidden rounded-xl border border-black/10 bg-[#0b1220] shadow-2xl md:rounded-2xl">
                                {/* Browser chrome */}
                                <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.04] px-3.5 py-2.5">
                                    <span className="h-3 w-3 flex-shrink-0 rounded-full bg-[#ff5f57]" />
                                    <span className="h-3 w-3 flex-shrink-0 rounded-full bg-[#febc2e]" />
                                    <span className="h-3 w-3 flex-shrink-0 rounded-full bg-[#28c840]" />
                                    <div className="ml-2 hidden min-w-0 flex-1 items-center rounded-md bg-white/[0.06] px-2.5 py-1 sm:flex">
                                        <span className="truncate font-sans text-[10px] tracking-wide text-white/40">
                                            dashboard.parchi.pk/corporate
                                        </span>
                                    </div>
                                </div>

                                <div className="relative">
                                    <Image
                                        src="/corporate-dashboard.png"
                                        alt="The Parchi merchant dashboard showing live redemptions, branch performance and campaign analytics"
                                        width={2880}
                                        height={1446}
                                        sizes="(max-width: 1024px) 100vw, 620px"
                                        className="h-auto w-full"
                                    />

                                    {/* Floating label */}
                                    <span className="absolute bottom-3 right-3 rounded-full bg-white px-4 py-2 font-sans text-[12px] font-bold text-primary shadow-lg md:bottom-5 md:right-5 md:px-5 md:py-2.5 md:text-[14px]">
                                        Merchant Dashboard
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: the pitch */}
                    <div className="order-1 flex flex-col justify-center lg:order-2">
                        <div className="mb-3 inline-block w-fit rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                            For Merchants
                        </div>

                        <h2 className="mb-4 font-heading text-3xl font-extrabold tracking-tighter text-primary sm:text-4xl md:text-5xl">
                            Grow Your Business with Gen Z.
                        </h2>

                        <p className="mb-8 max-w-[600px] text-muted-foreground md:text-lg/relaxed">
                            Tap into the student market with precision. Manage multiple branches, track
                            redemptions in real-time, and ensure secure verification.
                        </p>

                        <div className="grid gap-6">
                            {FEATURES.map((f) => (
                                <div key={f.title} className="flex gap-4">
                                    <f.icon className="mt-0.5 h-6 w-6 flex-shrink-0 text-primary" />
                                    <div>
                                        <h3 className="mb-1 font-heading font-extrabold leading-tight text-foreground">
                                            {f.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-9 flex flex-wrap items-center gap-5">
                            <Button size="lg" className="bg-primary font-bold text-white hover:bg-primary/90" asChild>
                                <Link href="/become-a-merchant">Become a Merchant</Link>
                            </Button>
                            <Link
                                href="/portal"
                                className="font-sans text-[13px] font-bold text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                            >
                                Merchant Login
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
