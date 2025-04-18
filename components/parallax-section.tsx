"use client"

import { useRef, useEffect, useState, type ReactNode } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

interface ParallaxSectionProps {
  children: ReactNode
  className?: string
  id?: string
  parallaxFactor?: number
  fadeIn?: boolean
}

export default function ParallaxSection({
  children,
  className = "",
  id,
  parallaxFactor = 0.2,
  fadeIn = true,
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [sectionTop, setSectionTop] = useState(0)
  const [sectionHeight, setSectionHeight] = useState(0)
  const [windowHeight, setWindowHeight] = useState(0)
  const { scrollY } = useScroll()

  useEffect(() => {
    const updateDimensions = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        setSectionTop(rect.top + window.scrollY)
        setSectionHeight(rect.height)
        setWindowHeight(window.innerHeight)
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    // Also update dimensions on scroll to ensure accuracy
    const handleScroll = () => {
      requestAnimationFrame(updateDimensions)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("resize", updateDimensions)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Parallax effect - using useTransform directly with scrollY
  const y = useTransform(
    scrollY,
    [sectionTop - windowHeight, sectionTop + sectionHeight],
    [parallaxFactor * 100, -parallaxFactor * 100],
  )

  // Calculate when section is in view for fade effect
  const opacity = useTransform(
    scrollY,
    [
      sectionTop - windowHeight,
      sectionTop - windowHeight / 2,
      sectionTop + sectionHeight - windowHeight / 2,
      sectionTop + sectionHeight,
    ],
    [0, 1, 1, 0],
  )

  return (
    <section ref={sectionRef} id={id} className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={{
          y: parallaxFactor !== 0 ? y : 0,
          opacity: fadeIn ? opacity : 1,
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </section>
  )
}
