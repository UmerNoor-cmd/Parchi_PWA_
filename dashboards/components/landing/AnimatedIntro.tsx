"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import Image from "next/image"

/**
 * Realistic Paper Tear Intro v7.1 - Fixed Framer Motion Types
 * 
 * Timeline:
 * 0.0s - 1.0s: Intact blue sheet (Perfectly solid, no hint of a seam)
 * 1.0s: INSTANT failure. Clip-path swaps, halves explode outward immediately.
 * 1.0s - 1.5s: Chaotic high-velocity tumble and fly-off.
 */

export function AnimatedIntro() {
  const [isVisible, setIsVisible] = useState(true)
  const [isRipped, setIsRipped] = useState(false)
  
  const leftControls = useAnimationControls()
  const rightControls = useAnimationControls()
  const logoControls = useAnimationControls()
  const edgeControls = useAnimationControls()

  // Jagged "failed" edge coordinates
  const points = [
    "50% 0%", "52.1% 4%", "47.8% 9%", "53.5% 15%", "46.2% 22%", 
    "54.8% 29%", "45.1% 37%", "52.9% 45%", "47.4% 53%", "54.2% 62%", 
    "46.5% 71%", "53.6% 80%", "48.2% 89%", "51.9% 96%", "50% 100%"
  ]
  const jaggedPath = points.join(", ")
  
  // Initial straight paths meet with overlap for seamless start
  const leftStraight = "polygon(0% 0%, 50.5% 0%, 50.5% 100%, 0% 100%)"
  const rightStraight = "polygon(100% 0%, 49.5% 0%, 49.5% 100%, 100% 100%)"
  
  const leftJagged = `polygon(0% 0%, ${jaggedPath}, 0% 100%)`
  const rightJagged = `polygon(100% 0%, ${jaggedPath}, 100% 100%)`

  useEffect(() => {
    async function runBurstAnimation() {
      // Wait for the steady logo display
      await new Promise(resolve => setTimeout(resolve, 1000))

      // INSTANT TEAR + EXPLOSION
      // 1. Swap the geometry to jagged
      setIsRipped(true)

      // 2. Start the high-energy burst motion
      const burstDuration = 0.5
      // Fixed: Framer Motion expects CubicBezier as [number, number, number, number] but typed as Easing
      const burstEase: any = [0.22, 1, 0.36, 1]

      // Left piece burst
      leftControls.start({
        x: [0, -60, -180, "-150%"],
        y: [0, -25, -80, -140],
        rotate: [0, -15, -25, -45],
        scale: [1, 1.05, 0.95, 0.9],
        skewX: [0, -12, 6, 0],
        skewY: [0, -4, 2, 0],
        transition: { 
          duration: burstDuration,
          times: [0, 0.2, 0.5, 1],
          ease: burstEase
        }
      })

      // Right piece burst (slight pivot offset for asymmetry)
      rightControls.start({
        x: [0, 60, 180, "150%"],
        y: [0, 30, 90, 160],
        rotate: [0, 18, 30, 50],
        scale: [1, 1.05, 0.95, 0.9],
        skewX: [0, 12, -6, 0],
        skewY: [0, 4, -2, 0],
        transition: { 
          duration: burstDuration,
          times: [0, 0.2, 0.5, 1],
          ease: burstEase
        }
      })

      // Fade in fibers and fade out logo at the exact same moment
      edgeControls.start({ opacity: 1, transition: { duration: 0.05 } })
      logoControls.start({ 
        opacity: [1, 0], 
        scale: [1, 1.25], 
        transition: { duration: 0.3, ease: "easeOut" } 
      })

      // Remove from DOM after pieces have cleared
      setTimeout(() => setIsVisible(false), 800)
    }

    runBurstAnimation()
  }, [leftControls, rightControls, logoControls, edgeControls])

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none bg-transparent">
          
          {/* 100% SOLID BACKING (0s -> 1s) */}
          {!isRipped && (
            <div className="absolute inset-0 bg-[#0051FF] z-0">
               <div className="absolute inset-0 opacity-12 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
            </div>
          )}

          {/* LEFT PIECE - High Energy */}
          <motion.div
            initial={{ x: 0, rotate: 0, scale: 1, y: 0, skewX: 0, skewY: 0 }}
            animate={leftControls}
            style={{ 
              transformOrigin: isRipped ? "center center" : "bottom center",
              clipPath: isRipped ? leftJagged : leftStraight,
              zIndex: 10
            }}
            className="absolute inset-0 pointer-events-auto"
          >
            <div className="absolute inset-0 bg-[#0051FF]">
              <div className="absolute inset-0 opacity-12 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
              {/* Internal stress flare */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={isRipped ? { opacity: [0, 0.2, 0] } : { opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-white/20 blur-xl pointer-events-none"
              />
            </div>

            {/* Structure Edges */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={edgeControls}
              className="absolute inset-0 bg-white"
              style={{ clipPath: leftJagged, zIndex: -1, transform: "translateX(2px)" }}
            />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={edgeControls}
              className="absolute inset-0 bg-black/60 blur-md"
              style={{ clipPath: leftJagged, zIndex: -2, transform: "translateX(6px)" }}
            />
          </motion.div>

          {/* RIGHT PIECE - High Energy */}
          <motion.div
            initial={{ x: 0, rotate: 0, scale: 1, y: 0, skewX: 0, skewY: 0 }}
            animate={rightControls}
            style={{ 
              transformOrigin: isRipped ? "center center" : "bottom center",
              clipPath: isRipped ? rightJagged : rightStraight,
              zIndex: 10
            }}
            className="absolute inset-0 pointer-events-auto"
          >
            <div className="absolute inset-0 bg-[#0051FF]">
              <div className="absolute inset-0 opacity-12 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
              <motion.div 
                initial={{ opacity: 0 }}
                animate={isRipped ? { opacity: [0, 0.2, 0] } : { opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-white/20 blur-xl pointer-events-none"
              />
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={edgeControls}
              className="absolute inset-0 bg-white"
              style={{ clipPath: rightJagged, zIndex: -1, transform: "translateX(-2px)" }}
            />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={edgeControls}
              className="absolute inset-0 bg-black/60 blur-md"
              style={{ clipPath: rightJagged, zIndex: -2, transform: "translateX(-6px)" }}
            />
          </motion.div>

          {/* DYNAMIC LOGO */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-[20]">
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={logoControls}
              className="flex flex-col items-center"
            >
              <Image
                src="/ParchiFullTextNewBlue.svg"
                alt="Parchi Logo"
                width={320}
                height={140}
                className="brightness-0 invert drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
                priority
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="h-[4px] bg-white/70 mt-12 rounded-full shadow-2xl"
              />
              <p className="text-white font-medium tracking-[0.45em] mt-10 text-[11px] uppercase opacity-90 drop-shadow-lg">Fintech for Pakistan&apos;s Students</p>
            </motion.div>
          </div>

          <div className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/p6-dark.png')] z-[30]" />
        </div>
      )}
    </AnimatePresence>
  )
}
