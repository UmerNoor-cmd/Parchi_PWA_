"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const NAV_LINKS = [
    { label: "About", href: "/#about" },
    { label: "Brands", href: "/#brands" },
    { label: "Features", href: "/#features" },
    { label: "For Merchants", href: "/#merchants" },
    { label: "FAQ", href: "/#faq" },
]

// Secondary journeys — surfaced in the mobile menu, and as the primary CTA on desktop.
const JOIN_LINKS = [
    { label: "Become a Merchant", href: "/become-a-merchant" },
    { label: "Campus Ambassador", href: "/campus-ambassador" },
    { label: "Merchant Login", href: "/portal" },
]

export function LandingNavbar({ navDelay = 2.2 }: { navDelay?: number } = {}) {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    // Close mobile menu on resize
    useEffect(() => {
        const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)
    }, [])

    return (
        <>
            <motion.header
                className="fixed top-0 left-0 right-0 z-[1000] transition-all duration-300"
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: navDelay }}
                style={{
                    background: scrolled
                        ? "rgba(255,255,255,0.88)"
                        : "transparent",
                    backdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
                    WebkitBackdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
                    boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.04)" : "none",
                }}
            >
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex items-center justify-between h-16">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                            <Image
                                src="/ParchiFullTextNewBlue.svg"
                                alt="Parchi"
                                width={100}
                                height={36}
                                className="h-8 w-auto"
                                priority
                            />
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="px-3 py-2 text-sm font-medium text-foreground/70 rounded-full transition-all duration-200 hover:text-primary hover:bg-primary/8"
                                    style={{ fontSize: "0.8125rem" }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Desktop CTAs */}
                        <div className="hidden md:flex items-center gap-2">
                            <Link
                                href="/portal"
                                className="hidden xl:inline-flex px-3 py-2 text-[0.8125rem] font-medium text-foreground/70 rounded-full transition-all duration-200 hover:text-primary hover:bg-primary/8"
                            >
                                Merchant Login
                            </Link>
                            <Link
                                href="/campus-ambassador"
                                className="inline-flex items-center rounded-full border border-primary/25 bg-primary/5 px-3.5 py-2 text-[0.8125rem] font-bold text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:border-transparent hover:scale-[1.03]"
                            >
                                Campus Ambassador
                            </Link>
                            <Link
                                href="/become-a-merchant"
                                className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-[0.8125rem] font-bold text-white transition-all duration-200 hover:bg-primary/90 hover:scale-[1.03]"
                            >
                                Become a Merchant
                            </Link>
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg transition-colors hover:bg-black/5"
                            onClick={() => setMobileOpen(v => !v)}
                            aria-label="Toggle menu"
                            aria-expanded={mobileOpen}
                        >
                            <span className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
                            <span className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
                            <span className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="fixed top-16 left-4 right-4 z-[999] max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl shadow-xl border border-white/20"
                        style={{
                            background: "rgba(255,255,255,0.96)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                        }}
                    >
                        <nav className="flex flex-col p-4 gap-1">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="px-4 py-3 text-sm font-medium text-foreground/80 rounded-xl hover:bg-primary/8 hover:text-primary transition-all duration-150"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <div className="border-t border-border/50 mt-2 pt-2 flex flex-col gap-1">
                                {JOIN_LINKS.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="px-4 py-3 text-sm font-bold text-primary rounded-xl hover:bg-primary/8 transition-all duration-150"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>

                            <div className="border-t border-border/50 mt-2 pt-3 flex gap-3 justify-center">
                                <Link
                                    href="https://apps.apple.com/app/parchi-the-student-app/id6760251460"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-all hover:scale-105 hover:opacity-90"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Image
                                        src="/app-store-badge.svg"
                                        alt="Download on the App Store"
                                        width={140}
                                        height={48}
                                        className="h-12 w-auto"
                                    />
                                </Link>
                                <Link
                                    href="https://play.google.com/store/apps/details?id=com.parchi.student&hl=en"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-all hover:scale-105 hover:opacity-90"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Image
                                        src="/google-play-badge.svg"
                                        alt="Get it on Google Play"
                                        width={140}
                                        height={48}
                                        className="h-12 w-auto"
                                    />
                                </Link>
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop for mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[998] bg-black/10"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    )
}
