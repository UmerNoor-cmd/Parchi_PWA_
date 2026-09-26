"use client"

import { useEffect, useRef, useState } from "react"
import { animate, motion, useInView, useReducedMotion } from "framer-motion"
import { ArrowUp, GraduationCap, MapPin, ShieldCheck } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { getPublicStats } from "@/lib/api-client"

type AboutUsStats = {
    totalMerchants: number
    totalStudents: number
    totalRedemptions: number
    redemptionsThisMonth: number
}

const PILLARS = [
    {
        icon: ShieldCheck,
        title: "Verified Only",
        desc: "Every member is a verified, currently enrolled student. No shortcuts, no resellers.",
    },
    {
        icon: MapPin,
        title: "Karachi First",
        desc: "One network recognised across the city's campuses — and growing from here.",
    },
    {
        icon: GraduationCap,
        title: "Built for Students",
        desc: "Designed around how students actually spend: food, coffee and late nights out.",
    },
]

// desc is [before, highlighted, after]
type StatCard = { title: string; value?: number; text?: string; desc: [string, string, string] }

// Product facts that top up the grid when live numbers are missing, so a card never reads "0+"
const FALLBACK_CARDS: StatCard[] = [
    { title: "Verified Members", text: "100%", desc: ["Every member is a ", "currently enrolled", " student"] },
    { title: "Verification", text: "24h", desc: ["Typical time to get your student profile ", "approved", ""] },
    { title: "Loyalty", text: "5", desc: ["Redemptions at one brand unlock a ", "bonus reward", ""] },
    { title: "Getting Started", text: "1 ID", desc: ["All it takes to ", "start saving", " at partner brands"] },
]

function formatCompact(n: number) {
    if (n < 1000) return String(n)
    return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
}

function CountUp({ value }: { value: number }) {
    const ref = useRef<HTMLSpanElement>(null)
    const inView = useInView(ref, { once: true, margin: "0px" })
    const reduceMotion = useReducedMotion()
    const [display, setDisplay] = useState(1)
    const [started, setStarted] = useState(false)
    // Last shown number, so a changed value animates on from there instead of restarting at 1
    const displayRef = useRef(1)

    // `started` is deliberately not a dependency: setting it re-renders, and re-running this
    // effect would call controls.stop() and freeze the counter at 1
    useEffect(() => {
        if (!inView) return
        setStarted(true)
        if (reduceMotion) {
            displayRef.current = value
            setDisplay(value)
            return
        }
        const controls = animate(displayRef.current, value, {
            duration: 1.4,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (v) => {
                const n = Math.max(1, Math.round(v))
                displayRef.current = n
                setDisplay(n)
            },
        })
        return () => controls.stop()
    }, [inView, reduceMotion, value])

    if (value <= 0) return null

    return (
        <>
            <span className="sr-only">{formatCompact(value)}+</span>
            <span ref={ref} aria-hidden className="tabular-nums">
                {started ? (
                    `${formatCompact(display)}+`
                ) : (
                    <Skeleton className="inline-block h-7 w-16 align-middle bg-primary/10 rounded-md" />
                )}
            </span>
        </>
    )
}

export function AboutUsSection({ stats }: { stats?: AboutUsStats }) {
    const hasValidInitialStats = Boolean(
        stats && (
            (stats.totalStudents ?? 0) > 0 ||
            (stats.totalMerchants ?? 0) > 0 ||
            (stats.totalRedemptions ?? 0) > 0 ||
            (stats.redemptionsThisMonth ?? 0) > 0
        )
    )

    const [currentStats, setCurrentStats] = useState<AboutUsStats | null>(
        hasValidInitialStats ? (stats as AboutUsStats) : null
    )
    const [isLoading, setIsLoading] = useState<boolean>(!hasValidInitialStats)

    useEffect(() => {
        let isMounted = true

        getPublicStats()
            .then((res) => {
                if (isMounted && res?.data) {
                    const data = res.data
                    if (
                        (data.totalStudents ?? 0) > 0 ||
                        (data.totalMerchants ?? 0) > 0 ||
                        (data.totalRedemptions ?? 0) > 0 ||
                        (data.redemptionsThisMonth ?? 0) > 0
                    ) {
                        setCurrentStats(data)
                    } else if (!hasValidInitialStats) {
                        setCurrentStats(data)
                    }
                }
            })
            .catch((err) => {
                console.error("Error fetching live public stats:", err)
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoading(false)
                }
            })

        return () => {
            isMounted = false
        }
    }, [hasValidInitialStats])

    const allLiveCards: StatCard[] = currentStats
        ? [
            { title: "Students", value: currentStats.totalStudents, desc: ["Verified students already ", "saving", " with Parchi"] },
            { title: "Partner Brands", value: currentStats.totalMerchants, desc: ["Restaurants and cafés offering ", "student-only deals", ""] },
            { title: "Redemptions", value: currentStats.totalRedemptions, desc: ["Discounts redeemed ", "across Karachi", " so far"] },
            { title: "This Month", value: currentStats.redemptionsThisMonth, desc: ["Deals redeemed ", "this month", " alone"] },
        ]
        : []
    const liveCards = allLiveCards.filter((c) => (c.value ?? 0) > 0)
    // Live numbers first, topped up with product facts so the grid always has four cards
    const cards: StatCard[] = [...liveCards, ...FALLBACK_CARDS].slice(0, 4)

    return (
        <section className="w-full overflow-hidden border-t bg-background py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

                    {/* Left: stat cards */}
                    <div className="order-2 lg:order-1">
                        {/* Grid geometry as inline styles: new arbitrary Tailwind classes weren't reaching the browser's stylesheet */}
                        <div
                            className="mx-auto w-full"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, minmax(0, 250px))",
                                justifyContent: "center",
                                gap: "clamp(16px, 3vw, 32px)",
                            }}
                        >
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col rounded-2xl border border-black/[0.06] bg-white p-3.5 shadow-md md:p-4"
                                    >
                                        <Skeleton className="h-4 w-20 rounded-md bg-black/5" />

                                        <div className="mt-4 flex items-end justify-between gap-2 border-b border-black/10 pb-2.5 md:mt-5">
                                            <Skeleton className="h-5 w-5 rounded-full bg-black/5" />
                                            <Skeleton className="h-8 w-20 rounded-md bg-black/5 md:h-10 md:w-24" />
                                        </div>

                                        <div className="mt-2.5 space-y-1.5">
                                            <Skeleton className="h-3 w-full rounded-md bg-black/5" />
                                            <Skeleton className="h-3 w-2/3 rounded-md bg-black/5" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                cards.map((c, i) => (
                                    <motion.div
                                        key={c.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-60px" }}
                                        transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                                        className="flex flex-col rounded-2xl border border-black/[0.06] bg-white p-3.5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:p-4"
                                    >
                                        <h3 className="font-sans text-sm font-semibold text-foreground">{c.title}</h3>

                                        <div className="mt-4 flex items-end justify-between gap-2 border-b border-black/10 pb-2.5 md:mt-5">
                                            <ArrowUp className="mb-0.5 h-4 w-4 flex-shrink-0 text-primary md:h-5 md:w-5" strokeWidth={1.5} />
                                            {/* Body font on purpose: every bundled Hagrid file is a trial whose digits render as "TRIAL ONLY" */}
                                            <span className="font-sans text-2xl font-extrabold leading-none tracking-tighter text-primary md:text-4xl">
                                                {c.value !== undefined ? <CountUp value={c.value} /> : c.text}
                                            </span>
                                        </div>

                                        <p className="mt-2.5 text-[11px] leading-snug text-muted-foreground">
                                            {c.desc[0]}
                                            <span className="font-semibold text-primary">{c.desc[1]}</span>
                                            {c.desc[2]}
                                        </p>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right: the story */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                        className="order-1 flex flex-col justify-center lg:order-2"
                    >
                        <div className="mb-3 inline-block w-fit rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                            About Parchi
                        </div>

                        <h2 className="mb-4 font-heading text-3xl font-extrabold tracking-tighter text-primary sm:text-4xl md:text-5xl">
                            Pakistan&apos;s First Student-Only Network.
                        </h2>

                        <p className="mb-8 max-w-[600px] text-muted-foreground md:text-lg/relaxed">
                            Parchi is a closed-loop ecosystem built exclusively for students — connecting
                            Karachi&apos;s most ambitious generation directly to the brands they love.
                            Not just deals. Infrastructure.
                        </p>

                        <div className="grid gap-6">
                            {PILLARS.map((p) => (
                                <div key={p.title} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 rounded-full bg-primary/10 p-3">
                                        <p.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="mb-1 font-heading text-lg font-extrabold leading-tight text-foreground">
                                            {p.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
