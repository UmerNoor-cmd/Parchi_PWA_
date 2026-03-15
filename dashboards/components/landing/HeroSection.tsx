"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useRef, useState, useEffect, useCallback } from "react"

// ─── Config ───────────────────────────────────────────────────────────────────
const PRIMARY = "#007AFF"

const BADGES = [
    { name: "Burning Brownie", pct: "20% off", color: "#E85D24" },
    { name: "Kababjees", pct: "15% off", color: "#D4A017" },
    { name: "Cosa Nostra", pct: "25% off", color: "#2E7D32" },
    { name: "Espresso", pct: "1 free ☕", color: "#6B3F2A" },
    { name: "Hot n Spicy", pct: "30% off", color: "#C62828" },
]

const MAX_SCANS = 3
const IDLE_PAUSE = 1600
const INITIAL_WAIT = 1800

function sleep(ms: number) {
    return new Promise<void>(r => setTimeout(r, ms))
}

// ─── Student ID Card ──────────────────────────────────────────────────────────
function StudentIDCard({
    wrapRef,
    isPulsing,
    isTiltLive,
}: {
    wrapRef: React.RefObject<HTMLDivElement | null>
    isPulsing: boolean
    isTiltLive: boolean
}) {
    const bodyRef = useRef<HTMLDivElement>(null)
    const glareRef = useRef<HTMLDivElement>(null)

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isTiltLive) return
        const el = bodyRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        el.style.transform = `rotateX(${-y * 16}deg) rotateY(${x * 16}deg)`
        if (glareRef.current) {
            const gx = Math.round((x + 0.5) * 100)
            const gy = Math.round((y + 0.5) * 100)
            glareRef.current.style.background = `radial-gradient(ellipse 60% 40% at ${gx}% ${gy}%, rgba(255,255,255,0.22) 0%, transparent 65%)`
        }
    }

    const handleMouseLeave = () => {
        if (!isTiltLive) return
        const el = bodyRef.current
        if (!el) return
        el.style.transition = "transform 0.6s cubic-bezier(.23,1,.32,1)"
        el.style.transform = "rotateX(0) rotateY(0)"
        setTimeout(() => { if (el) el.style.transition = "" }, 600)
        if (glareRef.current) {
            glareRef.current.style.background =
                "radial-gradient(ellipse 60% 40% at 25% 25%, rgba(255,255,255,0.22) 0%, transparent 65%)"
        }
    }

    return (
        <div
            ref={wrapRef}
            className="absolute select-none"
            style={{
                left: -40,
                top: "50%",
                // starts fully left — no overlap with phone at rest
                transform: "translateY(-50%) translateX(0px)",
                width: 210,
                height: 132,
                perspective: 900,
                zIndex: 15,   // ← IN FRONT of phone (z:10)
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div
                ref={bodyRef}
                className="w-full h-full rounded-2xl relative overflow-hidden"
                style={{
                    transformStyle: "preserve-3d",
                    background: PRIMARY,
                    boxShadow: `0 6px 32px rgba(0,122,255,0.38), 0 2px 8px rgba(0,0,0,0.14)`,
                    animation: isPulsing ? "parchi-card-pulse 2.8s ease-in-out infinite" : "none",
                }}
            >
                {/* Dot pattern */}
                <div
                    className="absolute inset-0 pointer-events-none z-[1]"
                    style={{
                        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
                        backgroundSize: "18px 18px",
                    }}
                />

                {/* Glare */}
                <div
                    ref={glareRef}
                    className="absolute inset-0 rounded-2xl pointer-events-none z-[4]"
                    style={{ background: "radial-gradient(ellipse 60% 40% at 25% 25%, rgba(255,255,255,0.22) 0%, transparent 65%)" }}
                />

                {/* Top band */}
                <div
                    className="absolute top-0 left-0 right-0 flex items-center px-3 gap-2 z-[3]"
                    style={{ height: 34, background: "rgba(0,0,0,0.18)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
                >
                    <div
                        className="flex-shrink-0 flex items-center justify-center rounded-full"
                        style={{ width: 20, height: 20, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
                    >
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M5.5 1L10 3.5V7.5L5.5 10L1 7.5V3.5Z" stroke="rgba(255,255,255,0.8)" strokeWidth="0.9" fill="none" />
                        </svg>
                    </div>
                    <span style={{ fontSize: 8, letterSpacing: "0.16em", color: "rgba(255,255,255,0.7)", fontFamily: "monospace", textTransform: "uppercase" }}>
                        Student ID
                    </span>
                </div>

                {/* Photo */}
                <div
                    className="absolute flex items-center justify-center rounded-md z-[3]"
                    style={{ top: 42, left: 12, width: 38, height: 48, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}
                >
                    <svg width="17" height="19" viewBox="0 0 17 19" fill="none">
                        <circle cx="8.5" cy="6" r="4" fill="rgba(255,255,255,0.25)" />
                        <path d="M1 18c0-4 3.4-6.5 7.5-6.5S16 14 16 18" fill="rgba(255,255,255,0.15)" />
                    </svg>
                </div>

                {/* Skeleton lines */}
                <div className="absolute flex flex-col gap-1.5 z-[3]" style={{ top: 46, left: 60 }}>
                    <div className="rounded" style={{ width: 88, height: 7, background: "rgba(255,255,255,0.22)" }} />
                    <div className="rounded" style={{ width: 64, height: 6, background: "rgba(255,255,255,0.22)" }} />
                    <div className="rounded" style={{ width: 76, height: 6, background: "rgba(255,255,255,0.22)", marginTop: 2 }} />
                </div>

                {/* Chip */}
                <div
                    className="absolute rounded z-[3]"
                    style={{ bottom: 12, left: 12, width: 24, height: 17, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.28)" }}
                />
            </div>
        </div>
    )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
export function HeroSection() {
    const cardWrapRef = useRef<HTMLDivElement>(null)
    const phoneWrapRef = useRef<HTMLDivElement>(null)

    const [isPulsing, setIsPulsing] = useState(true)
    const [isTiltLive, setIsTiltLive] = useState(true)
    const [phoneFlash, setPhoneFlash] = useState(false)
    const [beamKey, setBeamKey] = useState<number | null>(null)
    const [scansDone, setScansDone] = useState(0)
    const [visibleBadges, setVisibleBadges] = useState<number[]>([])

    // Slide card centre → phone centre (card ends up in front of phone)
    const getSlideToPhone = useCallback(() => {
        const cEl = cardWrapRef.current
        const pEl = phoneWrapRef.current
        if (!cEl || !pEl) return 0
        const cRect = cEl.getBoundingClientRect()
        const pRect = pEl.getBoundingClientRect()
        return (pRect.left + pRect.width / 2) - (cRect.left + cRect.width / 2)
    }, [])

    const applyCardTranslate = useCallback((dx: number) => {
        const el = cardWrapRef.current
        if (!el) return
        el.style.transition = "transform 0.65s cubic-bezier(.23,1,.32,1)"
        el.style.transform = `translateY(-50%) translateX(${dx}px)`
    }, [])

    const runScan = useCallback(async (iteration: number) => {
        setIsTiltLive(false)
        setIsPulsing(false)
        setVisibleBadges([])

        // 1. Slide card in front of phone
        applyCardTranslate(getSlideToPhone())
        await sleep(700)

        // 2. Flash phone screen
        setPhoneFlash(true)
        await sleep(120)
        setPhoneFlash(false)

        // 3. Scan beam on phone (visible around card edges)
        setBeamKey(Date.now())

        // 4. Pop all badges from right side
        await sleep(150)
        BADGES.forEach((_, i) => {
            setTimeout(() => setVisibleBadges(prev => [...prev, i]), i * 70)
        })

        await sleep(920)

        // 5. Slide card back to rest
        applyCardTranslate(0)
        setScansDone(iteration + 1)
        await sleep(700)
        setIsTiltLive(true)
    }, [applyCardTranslate, getSlideToPhone])

    useEffect(() => {
        let cancelled = false

        const loop = async () => {
            await sleep(INITIAL_WAIT)
            for (let i = 0; i < MAX_SCANS; i++) {
                if (cancelled) return
                await runScan(i)
                if (i < MAX_SCANS - 1) {
                    if (!cancelled) setIsPulsing(true)
                    await sleep(IDLE_PAUSE)
                    if (!cancelled) setIsPulsing(false)
                }
            }
            if (!cancelled) {
                setVisibleBadges(BADGES.map((_, i) => i))
                setIsPulsing(true)
                setIsTiltLive(true)
            }
        }

        loop()
        return () => { cancelled = true }
    }, [runScan])

    return (
        <>
            <style>{`
                @keyframes parchi-card-pulse {
                    0%,100% { box-shadow: 0 6px 32px rgba(0,122,255,0.28), 0 0 0 0px  rgba(0,122,255,0.08); }
                    50%     { box-shadow: 0 6px 40px rgba(0,122,255,0.44), 0 0 0 14px rgba(0,122,255,0.00); }
                }
                @keyframes parchi-phone-beam {
                    0%   { top: 10%; opacity: 0; }
                    8%   {           opacity: 1; }
                    92%  {           opacity: 1; }
                    100% { top: 88%; opacity: 0; }
                }
            `}</style>

            <section className="relative w-full min-h-screen flex flex-col items-center justify-start pt-20 pb-12 overflow-hidden bg-background">

                {/* Background */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[120px]" />
                    <div
                        className="absolute inset-0 opacity-[0.02]"
                        style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "40px 40px" }}
                    />
                </div>

                <div className="container relative z-10 px-4 mx-auto flex flex-col items-center">

                    {/* Headline */}
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

                    {/* Subtext */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-center mb-10 max-w-2xl"
                    >
                        <p className="text-lg md:text-xl text-muted-foreground font-sans leading-relaxed">
                            Show your student ID at 200+ restaurants across Pakistan — and save every time you eat out.
                        </p>
                    </motion.div>

                    {/* Download buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className="flex flex-row gap-4 mb-20"
                    >
                        <Link href="#" className="hover:scale-105 transition-transform duration-300">
                            <Image src="/app-store-badge.svg" alt="Download on the App Store" width={160} height={48} className="h-12 w-auto drop-shadow-sm" />
                        </Link>
                        <Link href="#" className="hover:scale-105 transition-transform duration-300">
                            <Image src="/google-play-badge.svg" alt="Get it on Google Play" width={160} height={48} className="h-12 w-auto drop-shadow-sm" />
                        </Link>
                    </motion.div>

                    {/* ── Stage: hidden on mobile, shown md+ ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.6, ease: "easeOut" }}
                        className="relative hidden md:block"
                        style={{ width: 800, height: 380 }}
                    >
                        {/* Card — z:15, starts left with clear space */}
                        <StudentIDCard
                            wrapRef={cardWrapRef}
                            isPulsing={isPulsing}
                            isTiltLive={isTiltLive}
                        />

                        {/* Phone — z:10, card slides in front of it */}
                        <div
                            ref={phoneWrapRef}
                            className="absolute"
                            style={{
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                width: 170,
                                zIndex: 10,
                            }}
                        >
                            {/* Glow */}
                            <div
                                className="absolute -bottom-6 left-1/2 -translate-x-1/2 -z-10 rounded-full"
                                style={{ width: "80%", height: 60, background: "rgba(0,122,255,0.16)", filter: "blur(40px)" }}
                            />

                            {/* Screen flash */}
                            <div
                                className="absolute inset-1 rounded-2xl pointer-events-none z-[11] transition-opacity duration-100"
                                style={{ background: PRIMARY, opacity: phoneFlash ? 0.16 : 0 }}
                            />

                            {/* Scan beam — remounts per scan */}
                            {beamKey !== null && (
                                <div
                                    key={beamKey}
                                    className="absolute pointer-events-none z-[12] rounded-sm"
                                    style={{
                                        left: "8%", right: "8%",
                                        height: 3,
                                        background: `linear-gradient(90deg, transparent, ${PRIMARY}, transparent)`,
                                        animation: "parchi-phone-beam 0.75s ease-in-out forwards",
                                    }}
                                />
                            )}

                            <Image
                                src="/phone.png"
                                alt="Parchi App"
                                width={828}
                                height={1792}
                                className="w-full h-auto drop-shadow-2xl relative z-10"
                                priority
                            />
                        </div>

                        {/* Badges — right of phone */}
                        <div
                            className="absolute flex flex-col gap-2.5 pointer-events-none"
                            style={{
                                left: "calc(50% + 160px)",
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 5,
                            }}
                        >
                            {BADGES.map((badge, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-1.5 rounded-full shadow-sm whitespace-nowrap"
                                    style={{
                                        padding: "5px 11px 5px 8px",
                                        background: "#ffffff",
                                        border: "0.5px solid rgba(0,0,0,0.09)",
                                        opacity: visibleBadges.includes(i) ? 1 : 0,
                                        transform: visibleBadges.includes(i) ? "translateX(0) scale(1)" : "translateX(12px) scale(0.85)",
                                        transition: "opacity 0.35s, transform 0.35s cubic-bezier(.34,1.56,.64,1)",
                                        transitionDelay: `${i * 70}ms`,
                                    }}
                                >
                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: badge.color }} />
                                    <span style={{ fontSize: 11, fontWeight: 500, color: "#111" }}>{badge.name}</span>
                                    <span style={{ fontSize: 10, color: "#666" }}>{badge.pct}</span>
                                </div>
                            ))}
                        </div>

                        {/* Scan progress dots */}
                        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {Array.from({ length: MAX_SCANS }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                                    style={{ background: i < scansDone ? PRIMARY : "#e0e0e0" }}
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Mobile fallback — just the phone */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.6, ease: "easeOut" }}
                        className="relative block md:hidden w-full max-w-[280px]"
                    >
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 -z-10 rounded-full w-4/5 h-14"
                            style={{ background: "rgba(0,122,255,0.16)", filter: "blur(40px)" }}
                        />
                        <Image
                            src="/phone.png"
                            alt="Parchi App"
                            width={828}
                            height={1792}
                            className="w-full h-auto drop-shadow-2xl"
                            priority
                        />
                    </motion.div>

                </div>
            </section>
        </>
    )
}