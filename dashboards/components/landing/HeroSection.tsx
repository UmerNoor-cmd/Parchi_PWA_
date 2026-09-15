"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ParchiCard } from "./ParchiCard"
import { ParchiWordmark } from "./ParchiWordmark"

export function HeroSection() {
    return (
        <section className="hero-section relative w-full overflow-hidden bg-background">

            {/* Hero spacing and watermark geometry as plain CSS, rendered with the component, so
                they never depend on a freshly generated Tailwind stylesheet (Safari can keep a stale one) */}
            <style>{`
                .hero-section {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                    min-height: 100svh;
                    padding-top: 5rem;
                    padding-bottom: 4.5rem;
                }
                .hero-main {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    padding-top: 0;
                    padding-bottom: 1rem; /* more room below than above lifts the centred content */
                }
                .hero-cta { margin-top: 1.5rem; gap: 1.25rem; }
                .hero-cta img { height: 3.75rem; width: auto; }
                @media (min-width: 1024px) { .hero-cta img { height: 4rem; } }

                .hero-wordmark {
                    position: absolute;
                    z-index: -10;
                    left: 50%;
                    top: 50%;
                    width: min(100%, 520px);
                    max-width: none;
                    aspect-ratio: 304.4 / 80.91;
                    transform: translate(-50%, -50%);
                    color: var(--primary);
                    opacity: 0.1;
                    pointer-events: none;
                    user-select: none;
                }
                @media (min-width: 1024px) { .hero-wordmark { left: 56%; top: 30%; width: min(62%, 860px); } }
            `}</style>

            {/* Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[120px]" />
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "40px 40px" }}
                />
            </div>

            <div className="hero-main relative z-10">
                <div className="container relative z-10 px-4 mx-auto grid items-center gap-16 lg:grid-cols-[1.15fr_1fr] lg:gap-8">

                    {/* Faded wordmark centred between the copy and the card; the grid is its stacking context */}
                    <ParchiWordmark aria-hidden className="hero-wordmark" />

                    {/* ── Left: copy ── */}
                    <div className="text-center lg:text-left">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-5xl md:text-6xl xl:text-7xl font-heading font-extrabold tracking-tight text-foreground leading-[1.1]"
                        >
                            Your Student ID, <br />
                            <span className="text-primary italic">Now Your Superpower.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg md:text-xl text-muted-foreground font-sans leading-relaxed"
                        >
                            Show your student ID at partner restaurants across Karachi — and save every time you eat out.
                        </motion.p>
                    </div>

                    {/* ── Right: tilted Parchi card ── */}
                    <div className="relative mx-auto w-full max-w-[400px]">
                        <motion.div
                            initial={{ opacity: 0, y: 40, rotate: 0 }}
                            animate={{ opacity: 1, y: 0, rotate: 6 }}
                            transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
                            className="relative lg:scale-[1.2] xl:scale-[1.35]"
                        >
                            {/* Backing plate, slightly less rotated than the card */}
                            <div
                                aria-hidden
                                className="absolute inset-0 translate-x-3 translate-y-4 -rotate-3 rounded-[20px] bg-primary/10"
                            />
                            <div className="relative drop-shadow-[0_24px_40px_rgba(0,122,255,0.25)]">
                                <ParchiCard autoFlip={2} />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Download CTAs anchor the bottom of the full-height hero */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="hero-cta container relative z-10 px-4 mx-auto flex flex-row justify-center gap-4"
            >
                <Link href="https://apps.apple.com/app/parchi-the-student-app/id6760251460" className="hover:scale-105 transition-transform duration-300">
                    <Image src="/app-store-badge.svg" alt="Download on the App Store" width={160} height={48} className="h-12 w-auto drop-shadow-sm" />
                </Link>
                <Link href="https://play.google.com/store/apps/details?id=com.parchi.student&hl=en" className="hover:scale-105 transition-transform duration-300">
                    <Image src="/google-play-badge.svg" alt="Get it on Google Play" width={160} height={48} className="h-12 w-auto drop-shadow-sm" />
                </Link>
            </motion.div>
        </section>
    )
}
