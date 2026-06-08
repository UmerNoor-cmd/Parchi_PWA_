"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const NAV_LINKS = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Brands", href: "#brands" },
    { label: "Features", href: "#features" },
    { label: "About", href: "#about" },
    { label: "FAQ", href: "#faq" },
]

export function LandingNavbar() {
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
                transition={{ duration: 0.5, ease: "easeOut", delay: 2.2 }}
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
                                    className="px-4 py-2 text-sm font-medium text-foreground/70 rounded-full transition-all duration-200 hover:text-primary hover:bg-primary/8"
                                    style={{ fontSize: "0.8125rem" }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Desktop CTA */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                href="/portal"
                                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors duration-200"
                                style={{ fontSize: "0.8125rem" }}
                            >
                                Login
                            </Link>
                            <Link
                                href="https://apps.apple.com/app/parchi-the-student-app/id6760251460"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md hover:-translate-y-px"
                                style={{ fontSize: "0.8125rem" }}
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                                </svg>
                                Download App
                            </Link>
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg transition-colors hover:bg-black/5"
                            onClick={() => setMobileOpen(v => !v)}
                            aria-label="Toggle menu"
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
                        className="fixed top-16 left-4 right-4 z-[999] rounded-2xl shadow-xl border border-white/20 overflow-hidden"
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
                            <div className="border-t border-border/50 mt-2 pt-3 flex flex-col gap-2">
                                <Link
                                    href="/portal"
                                    className="px-4 py-3 text-sm font-medium text-center text-foreground/70 rounded-xl hover:bg-black/5 transition-all"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="https://apps.apple.com/app/parchi-the-student-app/id6760251460"
                                    className="px-4 py-3 text-sm font-semibold text-center text-white rounded-xl bg-primary hover:bg-primary/90 transition-all"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Download App
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
