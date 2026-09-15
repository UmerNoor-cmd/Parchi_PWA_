"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Web port of the app's ParchiCard (Parchi-Flutter: parchi_card.dart), standard
 * variant (not golden / founder's club / guest). Values mirror the widget 1:1:
 * 200px tall, radius 20, primary fill, 600ms easeInOutBack flip on tap.
 */

const CARD_YELLOW = "#E3E935"
const EASE_IN_OUT_BACK = "cubic-bezier(0.68, -0.55, 0.265, 1.55)" // Curves.easeInOutBack

// Demo cardholder — the landing page has no signed-in student.
const DEMO = {
    studentName: "Ayesha Khan",
    universityName: "IBA Karachi",
    studentId: "24017",
    visits: "24",
    bonuses: "4",
    rank: "#12",
}

// assets/parchi-icon.svg (viewBox 2000 × 1415)
const MARK_POINTS =
    "127.39,639.76 713.84,204.98 630.42,689.06 723.95,211.3 1019.6,716.12 1473.76,27.63 1968,682.7 1047.69,1381.67 1021.36,834.87 1021.45,1390.6 625.55,789.65 31.33,997.45"

function Stat({ value, label, subLabel }: { value: string; label: string; subLabel: string }) {
    return (
        <div className="flex flex-col items-center justify-center text-center">
            <span className="text-[28px] font-black leading-none text-white">{value}</span>
            <span
                className="mt-1.5 text-[10px] font-extrabold uppercase tracking-[1.2px]"
                style={{ color: CARD_YELLOW }}
            >
                {label}
            </span>
            <span className="mt-0.5 text-[9px] font-medium text-white/60">{subLabel}</span>
        </div>
    )
}

const Divider = () => <span className="my-2.5 w-px bg-white/20" aria-hidden />

// Auto-flip timing: first flip waits for the AnimatedIntro splash (~2.3s) to clear.
const AUTO_FLIP_START = 3000
const AUTO_FLIP_HOLD_BACK = 1800
const AUTO_FLIP_HOLD_FRONT = 1600

/**
 * @param autoFlip Number of front → back → front round trips to play on mount,
 *   hinting that the card is interactive. Stops as soon as the user flips it.
 */
export function ParchiCard({ autoFlip = 0 }: { autoFlip?: number }) {
    const [isFront, setIsFront] = useState(true)
    const userFlipped = useRef(false)

    useEffect(() => {
        if (!autoFlip || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

        const timers: number[] = []
        let at = AUTO_FLIP_START
        for (let i = 0; i < autoFlip * 2; i++) {
            timers.push(
                window.setTimeout(() => {
                    if (!userFlipped.current) setIsFront((f) => !f)
                }, at),
            )
            at += i % 2 === 0 ? AUTO_FLIP_HOLD_BACK : AUTO_FLIP_HOLD_FRONT
        }
        return () => timers.forEach(clearTimeout)
    }, [autoFlip])

    const flip = () => {
        userFlipped.current = true
        setIsFront((f) => !f)
    }

    return (
        <div className="mx-auto w-full max-w-[400px] [perspective:1000px]">
            <div
                role="button"
                tabIndex={0}
                aria-pressed={!isFront}
                aria-label={isFront ? "Flip the Parchi card" : "Flip back to the Parchi ID"}
                onClick={flip}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        flip()
                    }
                }}
                className="relative h-[200px] w-full cursor-pointer rounded-[20px] outline-none transition-transform duration-[600ms] [transform-style:preserve-3d] focus-visible:ring-4 focus-visible:ring-primary/30 motion-reduce:transition-none"
                style={{
                    transform: isFront ? "rotateY(0deg)" : "rotateY(180deg)",
                    transitionTimingFunction: EASE_IN_OUT_BACK,
                }}
            >
                {/* ── Front (CardFrontContent) ── */}
                <div className="absolute inset-0 overflow-hidden rounded-[20px] bg-primary [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
                    {/* Positioned(right: -90, top: -80) — flipped mark, height 300, white 10% */}
                    <svg
                        className="pointer-events-none absolute right-[-90px] top-[-80px] h-[300px] w-[424px] -scale-x-100"
                        viewBox="0 0 2000 1415"
                        aria-hidden
                    >
                        <polygon points={MARK_POINTS} fill="#fff" fillOpacity={0.1} />
                    </svg>

                    <div className="relative flex h-full flex-col justify-between p-5">
                        {/* ParchiFullText, height 30, tinted #E3E935 */}
                        <span
                            role="img"
                            aria-label="Parchi"
                            className="block h-[30px] w-[113px]"
                            style={{
                                backgroundColor: CARD_YELLOW,
                                WebkitMaskImage: "url(/ParchiFullTextNewBlue.svg)",
                                maskImage: "url(/ParchiFullTextNewBlue.svg)",
                                WebkitMaskSize: "contain",
                                maskSize: "contain",
                                WebkitMaskRepeat: "no-repeat",
                                maskRepeat: "no-repeat",
                                WebkitMaskPosition: "left center",
                                maskPosition: "left center",
                            }}
                        />

                        <div className="flex items-end justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-[14px] font-bold tracking-[0.1px] text-white">
                                    {DEMO.studentName}
                                </p>
                                <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.1px] text-white/70">
                                    {DEMO.universityName}
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-[24px] font-black tracking-[1px] text-white">{DEMO.studentId}</p>
                                <p className="text-[8px] font-black tracking-[0.5px] text-white/70">PARCHI ID</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Back (_buildBackFace → _buildStatsContent) ── */}
                <div
                    className="absolute inset-0 rounded-[20px] border border-primary/50 bg-primary p-5 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
                    style={{ transform: "rotateY(180deg)" }}
                >
                    <div className="flex h-full items-center">
                        <div className="flex w-full items-stretch justify-evenly">
                            <Stat value={DEMO.visits} label="Visits" subLabel="Lifetime" />
                            <Divider />
                            <Stat value={DEMO.bonuses} label="Bonuses" subLabel="Earned" />
                            <Divider />
                            <Stat value={DEMO.rank} label="Rank" subLabel="Nationwide" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
