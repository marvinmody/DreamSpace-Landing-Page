"use client"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function WelcomeAnimation() {
  const [showAnimation, setShowAnimation] = useState(true)
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  // Prevent scrolling when animation is active
  useEffect(() => {
    if (showAnimation) {
      // Save the current overflow style
      const originalStyle = window.getComputedStyle(document.body).overflow
      // Prevent scrolling
      document.body.style.overflow = "hidden"
      // Custom cursor for the welcome screen
      document.body.style.cursor = "auto"

      // Restore scrolling when animation is done
      return () => {
        document.body.style.overflow = originalStyle
        document.body.style.cursor = "auto"
      }
    }
  }, [showAnimation])

  // Starry background animation
  useEffect(() => {
    if (!canvasRef.current || !showAnimation) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Star properties
    const stars: {
      x: number
      y: number
      size: number
      opacity: number
      speed: number
    }[] = []

    // Create stars - smaller and more numerous for realism
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1, // Very small stars
        opacity: Math.random() * 0.5 + 0.1, // Subtle opacity
        speed: Math.random() * 0.02 + 0.005, // Very slow movement
      })
    }

    // Animation function
    const animate = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw stars with subtle twinkling
      stars.forEach((star, i) => {
        // Subtle opacity variation
        star.opacity = 0.1 + Math.sin(Date.now() * 0.001 + i) * 0.1 + 0.3

        // Draw star
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fill()

        // Move stars very slightly
        stars[i].y += star.speed

        // Reset stars that go off screen
        if (star.y > canvas.height) {
          stars[i].y = 0
          stars[i].x = Math.random() * canvas.width
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [showAnimation])

  // Smooth transition when clicking "Enter Dreamspace"
  const completeAnimation = () => {
    if (isTransitioning) return // Prevent multiple clicks

    setIsTransitioning(true)

    // Simple fade transition
    setTimeout(() => {
      sessionStorage.setItem("hasSeenIntro", "true")
      setShowAnimation(false)
      document.body.style.overflow = "auto"
    }, 800)
  }

  // Check if we've already shown the animation in this session
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro")
    if (hasSeenIntro) {
      setShowAnimation(false)
    }
  }, [])

  if (!showAnimation) return null

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.8,
              ease: "easeInOut",
            },
          }}
        >
          {/* Stars canvas */}
          <canvas ref={canvasRef} className="absolute inset-0" />

          <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
            {/* Logo animation */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 mb-8"
            >
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design-4DqE0K5GAvZaNDFrySNIUiqsOVhKg9.gif"
                alt="DreamSpace Logo"
                width="220"
                height="220"
                className="w-56 h-56 object-contain"
              />
            </motion.div>

            {/* Text animations */}
            <div className="text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mb-4"
              >
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Black%20And%20White%20Aesthetic%20Minimalist%20Modern%20Simple%20Typography%20Coconut%20Cosmetics%20Logo-FZR2TAaloYcD1POFPvJs3NQNIRpJXf.png"
                  alt="dreamspace"
                  className="h-20 mx-auto"
                />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-3xl md:text-4xl font-light text-white mb-8"
              >
                Where dreams become <span className="font-medium">design</span>
              </motion.h1>

              {/* Enhanced button with integrated hover effect */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                onClick={completeAnimation}
                className="interactive relative px-10 py-4 bg-transparent text-white rounded-full font-medium text-lg transition-all duration-300 overflow-hidden group border border-white/20"
                disabled={isTransitioning}
              >
                {/* Enhanced button background with smoother transition */}
                <div
                  className="absolute inset-0 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100"
                  style={{
                    background: "linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(59, 130, 246, 0.3))",
                  }}
                ></div>

                {/* Subtle glow effect */}
                <div
                  className="absolute inset-0 transition-opacity duration-500 ease-out opacity-0 group-hover:opacity-100"
                  style={{
                    boxShadow: "0 0 20px 5px rgba(59, 130, 246, 0.15)",
                  }}
                ></div>

                {/* Button text with subtle animation */}
                <span className="relative z-10 flex items-center justify-center">
                  <span className="transition-transform duration-300 group-hover:scale-105">Enter Dreamspace</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2 transition-all duration-300 transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </motion.button>
            </div>
          </div>

          {/* Simple fade transition */}
          {isTransitioning && (
            <motion.div
              className="absolute inset-0 z-20 bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
