"use client" // Needed for interactivity if we add it, but good practice for client components
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { BarChart3, ShieldCheck, Store } from "lucide-react"

export function MerchantFeaturesSection() {
    return (
        <section className="w-full py-6 md:py-12 lg:py-16 bg-background border-t">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">

                    {/* Left Side: Visuals (Real Corporate Dashboard screenshot) */}
                    <div className="order-2 lg:order-1 mx-auto flex w-full max-w-[600px] flex-col items-center justify-center space-y-4">
                        <div className="w-full rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
                            <Image
                                src="/corporate-dashboard.png"
                                alt="Parchi Corporate Dashboard"
                                width={2880}
                                height={1446}
                                className="w-full h-auto"
                            />
                        </div>
                    </div>

                    {/* Right Side: Content */}
                    <div className="order-1 lg:order-2 flex flex-col justify-center space-y-4">
                        <div className="space-y-2">
                            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary mb-2">
                                For Merchants
                            </div>
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-heading text-primary">
                                Grow Your Business with Gen Z.
                            </h2>
                            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                                Tap into the student market with precision. Manage multiple branches, track redemptions in real-time, and ensure secure verification.
                            </p>
                        </div>

                        <div className="grid gap-6 mt-6">
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    <Store className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Corporate & Branch Management</h3>
                                    <p className="text-sm text-muted-foreground">Centralized control for franchises. Assign managers to specific branches with custom access levels.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    <BarChart3 className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Real-time Analytics</h3>
                                    <p className="text-sm text-muted-foreground">Know exactly how many students visited, what they bought, and your ROI.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    <ShieldCheck className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Secure Verification</h3>
                                    <p className="text-sm text-muted-foreground">Zero fraud. Our closed-loop system ensures only verified active students can redeem offers.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold" asChild>
                                <Link href="/auth/login">
                                    Become a Partner
                                </Link>
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
