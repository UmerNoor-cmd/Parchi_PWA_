"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

export function HeroSection() {
    return (
        <section className="relative w-full min-h-screen flex flex-col items-center justify-start pt-20 pb-12 overflow-hidden bg-background">
            {/* Subtle Gradient Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[120px]" />
                {/* Abstract subtle pattern */}
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="container relative z-10 px-4 mx-auto flex flex-col items-center">
                {/* 1. Main Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center space-y-4 mb-6"
                >
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-extrabold tracking-tight text-foreground leading-[1.1]">
                        Your Student ID, <br />
                        <span className="text-primary italic">Now Your Superpower.</span>
                    </h1>
                </motion.div>

                {/* 2. Subtext */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-center mb-10 max-w-2xl"
                >
                    <p className="text-lg md:text-xl text-muted-foreground font-sans leading-relaxed">
                        Join 50k+ Pakistani students saving every day. Get exclusive discounts at top brands, digitalize your campus life, and unlock a world of perks.
                    </p>
                </motion.div>

                {/* 3. App Download Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="flex flex-row gap-4 mb-16"
                >
                    <Link href="#" className="hover:scale-105 transition-transform duration-300">
                        <Image
                            src="/app-store-badge.svg"
                            alt="Download on the App Store"
                            width={160}
                            height={48}
                            className="h-12 w-auto drop-shadow-sm"
                        />
                    </Link>
                    <Link href="#" className="hover:scale-105 transition-transform duration-300">
                        <Image
                            src="/google-play-badge.svg"
                            alt="Get it on Google Play"
                            width={160}
                            height={48}
                            className="h-12 w-auto drop-shadow-sm"
                        />
                    </Link>
                </motion.div>

                {/* 4. Phone Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                    className="relative w-full max-w-[320px] md:max-w-[380px] lg:max-w-[420px] flex justify-center"
                >
                    {/* Shadow & Glow under phone */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-20 bg-primary/20 blur-[60px] rounded-full -z-10" />
                    
                    <div className="relative z-10 w-full">
                        <Image
                            src="/phone.png"
                            alt="Parchi App Interface"
                            width={828}
                            height={1792}
                            className="w-full h-auto drop-shadow-2xl"
                            priority
                        />
                    </div>

                    {/* Decorative floating elements (Subtle) */}
                    <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -left-12 top-1/4 w-16 h-16 bg-white rounded-2xl shadow-lg border border-primary/10 flex items-center justify-center p-3 z-20 hidden md:flex"
                    >
                        <div className="w-full h-full bg-primary/10 rounded-lg" />
                    </motion.div>
                    <motion.div 
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -right-16 top-1/2 w-20 h-20 bg-white rounded-2xl shadow-xl border border-primary/10 flex items-center justify-center p-4 z-20 hidden md:flex"
                    >
                         <div className="w-full h-full bg-secondary/20 rounded-lg" />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
