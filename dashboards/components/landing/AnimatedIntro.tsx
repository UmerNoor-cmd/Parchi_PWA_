"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

export function AnimatedIntro() {
  const [isVisible, setIsVisible] = useState(true)
  const [isTearing, setIsTearing] = useState(false)

  useEffect(() => {
    // Show logo for 1 second, then start tearing
    const timer = setTimeout(() => {
      setIsTearing(true)
    }, 1000)

    // Complete animation after tear duration
    const hideTimer = setTimeout(() => {
        setIsVisible(false)
    }, 2200) // 1s wait + 1.2s animation

    return () => {
      clearTimeout(timer)
      clearTimeout(hideTimer)
    }
  }, [])

  // The jagged tear line coordinates (as percentages)
  // We'll create two polygons that meet at this jagged line
  const tearPath = "50% 0%, 52% 10%, 48% 22%, 53% 35%, 47% 48%, 52% 62%, 49% 75%, 53% 88%, 50% 100%"
  
  const leftPolygon = `polygon(0% 0%, ${tearPath}, 0% 100%)`
  const rightPolygon = `polygon(100% 0%, ${tearPath}, 100% 100%)`

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {/* Left Half */}
          <motion.div
            initial={{ x: "0%", clipPath: "polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)" }}
            animate={isTearing ? { 
                x: "-100%", 
                clipPath: leftPolygon,
                transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } 
            } : {
                clipPath: "polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)"
            }}
            className="absolute inset-0 bg-[#0051FF] pointer-events-auto"
          >
             {/* Realistic paper edge fiber for the left half */}
            <motion.div 
                animate={isTearing ? { opacity: 1 } : { opacity: 0 }}
                className="absolute inset-0 bg-white/20"
                style={{ 
                    clipPath: `polygon(49.5% 0%, 51.5% 10%, 47.5% 22%, 52.5% 35%, 46.5% 48%, 51.5% 62%, 48.5% 75%, 52.5% 88%, 49.5% 100%, 50% 100%, 53% 88%, 49% 75%, 52% 62%, 47% 48%, 53% 35%, 48% 22%, 52% 10%, 50% 0%)` 
                }}
            />
          </motion.div>

          {/* Right Half */}
          <motion.div
            initial={{ x: "0%", clipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)" }}
            animate={isTearing ? { 
                x: "100%", 
                clipPath: rightPolygon,
                transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } 
            } : {
                clipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)"
            }}
            className="absolute inset-0 bg-[#0051FF] pointer-events-auto"
          >
             {/* Realistic paper edge fiber for the right half */}
             <motion.div 
                animate={isTearing ? { opacity: 1 } : { opacity: 0 }}
                className="absolute inset-0 bg-white/20"
                style={{ 
                    clipPath: `polygon(50.5% 0%, 52.5% 10%, 48.5% 22%, 53.5% 35%, 47.5% 48%, 52.5% 62%, 49.5% 75%, 53.5% 88%, 50.5% 100%, 50% 100%, 53% 88%, 49% 75%, 52% 62%, 47% 48%, 53% 35%, 48% 22%, 52% 10%, 50% 0%)` 
                }}
            />
          </motion.div>

          {/* Centered Logo - Fades out just as tear starts */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isTearing ? { 
                  opacity: 0, 
                  scale: 1.1,
                  transition: { duration: 0.4 } 
              } : { 
                  opacity: 1, 
                  scale: 1,
                  transition: { duration: 0.5 }
              }}
              className="z-10"
            >
              <Image
                src="/ParchiFullTextNewBlue.svg"
                alt="Parchi Logo"
                width={320}
                height={140}
                className="brightness-0 invert drop-shadow-2xl"
                priority
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="h-[3px] bg-white/40 mt-6 rounded-full"
              />
            </motion.div>
          </div>

          {/* Paper Texture Overlay */}
          <motion.div
            initial={{ opacity: 0.05 }}
            animate={isTearing ? { opacity: 0 } : { opacity: 0.05 }}
            className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-multiply"
          />
        </div>
      )}
    </AnimatePresence>
  )
}
