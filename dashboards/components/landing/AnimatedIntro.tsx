"use client"

import { useLayoutEffect, useState } from "react"
import Image from "next/image"

/**
 * Paper Tear Intro v9 — plays once per browser.
 *
 * Every motion is a CSS keyframe on transform/opacity/visibility, so it runs on
 * the compositor thread and stays smooth while the landing page hydrates.
 * No React state changes happen during the animation.
 *
 * Timeline (ms):
 *    0–1000  logo hold
 * 1000–1150  sheet stress bulge
 * 1150–1370  crack draws top → bottom
 *      1370  rip: sheet hidden, halves fly apart (650ms), logo + flash fade
 *      2050  overlay hidden; component unmounts at TOTAL_MS
 */

const STORAGE_KEY = "parchi-intro-seen"
const INTRO_ATTR = "data-parchi-intro"
const TOTAL_MS = 2300

const MODE_KEY = "__parchiIntro"

declare global {
  interface Window { [MODE_KEY]?: "play" | "skip" }
}

// Runs during HTML parse, before first paint, so returning visitors never see a
// flash of the overlay. Marks the intro as seen as soon as it starts playing.
// The decision is kept on `window` too: React can wipe <html> attributes if it
// has to re-render the document after a hydration error.
const GATE_SCRIPT = `(function(){var m="play";try{if(localStorage.getItem("${STORAGE_KEY}")){m="skip"}else{localStorage.setItem("${STORAGE_KEY}","1")}}catch(e){}window.${MODE_KEY}=m;document.documentElement.setAttribute("${INTRO_ATTR}",m)})()`

// ---------- torn edge path generation ----------
// 40-point path with macro waves + micro serrations
const TEAR_POINTS = Array.from({ length: 41 }, (_, i) => {
  const y = (i / 40) * 100
  const macro = Math.sin(i * 0.55 + 1.2) * 2.8
  const micro = (i % 2 === 0 ? 1 : -1) * (0.6 + Math.abs(Math.sin(i * 1.7)) * 1.1)
  const stress = y > 30 && y < 70 ? Math.sin(i * 2.3) * 1.4 : 0
  return { x: 50 + macro + micro + stress, y }
})

const TEAR_PATH = TEAR_POINTS.map(p => `${p.x.toFixed(2)}% ${p.y.toFixed(2)}%`).join(", ")
const LEFT_CLIP = `polygon(0% 0%, ${TEAR_PATH}, 0% 100%)`
const RIGHT_CLIP = `polygon(100% 0%, ${TEAR_PATH}, 100% 100%)`
const CRACK_POLYLINE = TEAR_POINTS.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")

const PAPER_TEXTURE = "bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"

const CSS = `
html[${INTRO_ATTR}="skip"] .pi-root { display: none; }
@media (prefers-reduced-motion: reduce) { .pi-root { display: none; } }

.pi-root { animation: pi-hide 1ms 2050ms forwards; }
.pi-layer { position: absolute; inset: 0; }
.pi-gpu { will-change: transform, opacity; backface-visibility: hidden; }

.pi-sheet { animation: pi-stress 150ms 1000ms ease-in-out, pi-hide 1ms 1370ms forwards; }
.pi-crack { transform: translateY(-100%); animation: pi-slide-in 220ms 1150ms cubic-bezier(.55,0,.8,.4) forwards, pi-hide 1ms 1370ms forwards; }
.pi-crack > svg { transform: translateY(100%); animation: pi-slide-in 220ms 1150ms cubic-bezier(.55,0,.8,.4) forwards; }

.pi-left  { transform-origin: 30% 50%; animation: pi-left 650ms 1370ms cubic-bezier(.5,0,.45,1) forwards; }
.pi-right { transform-origin: 70% 50%; animation: pi-right 650ms 1370ms cubic-bezier(.5,0,.45,1) forwards; }

.pi-logo { animation: pi-logo-out 180ms 1370ms ease-out forwards; }
.pi-bar  { transform: scaleX(0); animation: pi-bar 900ms ease-out forwards; }
.pi-flash { opacity: 0; animation: pi-flash 250ms 1370ms ease-out forwards; }

@keyframes pi-hide { to { visibility: hidden; } }
@keyframes pi-stress {
  33% { transform: scale(1.008, .997); }
  66% { transform: scale(.996, 1.005); }
}
@keyframes pi-slide-in { to { transform: translateY(0); } }
@keyframes pi-left {
  from { transform: translate3d(0, 0, 0) rotate(0) scaleX(1); }
  to   { transform: translate3d(-145%, -120px, 0) rotate(-38deg) scaleX(.88); }
}
@keyframes pi-right {
  from { transform: translate3d(0, 0, 0) rotate(0) scaleX(1); }
  to   { transform: translate3d(145%, 155px, 0) rotate(46deg) scaleX(.88); }
}
@keyframes pi-logo-out { to { opacity: 0; transform: scale(1.18); } }
@keyframes pi-bar { to { transform: scaleX(1); } }
@keyframes pi-flash { from { opacity: .25; } to { opacity: 0; } }
`

function PaperHalf({ side }: { side: "left" | "right" }) {
  const clipPath = side === "left" ? LEFT_CLIP : RIGHT_CLIP
  const dir = side === "left" ? 1 : -1

  return (
    <div className={`pi-layer pi-gpu pi-${side}`} style={{ zIndex: 10 }}>
      {/* Exposed paper interior — warm cream */}
      <div className="pi-layer" style={{ clipPath, background: "#e8dfc8", transform: `translateX(${5 * dir}px)` }} />
      {/* White fibrous torn edge */}
      <div className="pi-layer bg-white" style={{ clipPath, transform: `translateX(${2.5 * dir}px)` }} />
      {/* Blue face */}
      <div className="pi-layer bg-[#0051FF]" style={{ clipPath }}>
        <div className={`pi-layer opacity-[0.10] mix-blend-multiply ${PAPER_TEXTURE}`} />
        {/* Peel shadow — darkens near the tear edge */}
        <div
          className="pi-layer"
          style={{ background: `linear-gradient(to ${side === "left" ? "left" : "right"}, rgba(0,0,30,0.30) 0%, transparent 12%)` }}
        />
      </div>
    </div>
  )
}

// ---------- component ----------
export function AnimatedIntro() {
  const [isVisible, setIsVisible] = useState(true)

  useLayoutEffect(() => {
    const root = document.documentElement
    let mode = window[MODE_KEY]

    // Client-side navigation: the gate script didn't run, so decide here.
    if (!mode) {
      try {
        mode = localStorage.getItem(STORAGE_KEY) ? "skip" : "play"
        if (mode === "play") localStorage.setItem(STORAGE_KEY, "1")
      } catch {
        mode = "play"
      }
      window[MODE_KEY] = mode
    }

    const finish = () => {
      window[MODE_KEY] = "skip"
      root.setAttribute(INTRO_ATTR, "skip")
      setIsVisible(false)
    }

    if (mode === "skip") {
      finish()
      return
    }

    const timer = setTimeout(finish, TOTAL_MS)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: GATE_SCRIPT }} />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="pi-root fixed inset-0 z-[9999] overflow-hidden pointer-events-none" aria-hidden>
        <PaperHalf side="left" />
        <PaperHalf side="right" />

        {/* ── Solid sheet — covers the halves until the rip ───────────── */}
        <div className="pi-layer pi-gpu pi-sheet bg-[#0051FF]" style={{ zIndex: 15 }}>
          <div className={`pi-layer opacity-[0.10] mix-blend-multiply ${PAPER_TEXTURE}`} />
          <div className="pi-layer opacity-[0.08] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/p6-dark.png')]" />
        </div>

        {/* ── Crack — revealed top→bottom by a sliding mask ────────────── */}
        <div className="pi-layer pi-gpu pi-crack overflow-hidden" style={{ zIndex: 16 }}>
          <svg
            className="pi-layer pi-gpu h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polyline
              points={CRACK_POLYLINE}
              fill="none"
              stroke="white"
              strokeWidth={2.5}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <div className="pi-layer flex flex-col items-center justify-center" style={{ zIndex: 20 }}>
          <div className="pi-gpu pi-logo flex flex-col items-center">
            <Image
              src="/ParchiFullTextNewBlue.svg"
              alt="Parchi Logo"
              width={320}
              height={140}
              className="brightness-0 invert drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
              priority
            />
            <div className="pi-bar h-[4px] self-stretch bg-white/70 mt-12 rounded-full shadow-2xl" />
            <p className="text-white font-medium tracking-[0.45em] mt-10 text-[11px] uppercase opacity-90 drop-shadow-lg">
              Fintech for Pakistan&apos;s Students
            </p>
          </div>
        </div>

        {/* ── Tear flash — white burst at snap moment ──────────────────── */}
        <div className="pi-layer pi-flash bg-white" style={{ zIndex: 24 }} />
      </div>
    </>
  )
}
