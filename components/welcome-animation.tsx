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

      // Restore scrolling when animation is done
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [showAnimation])

  // Generate stars for the animation
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
      twinkleSpeed: number
      twinkleDirection: number
    }[] = []

    // Create stars - smaller and more numerous for realism
    for (let i = 0; i < 500; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.2, // Smaller stars (max 1.2px)
        opacity: Math.random() * 0.8 + 0.2, // Varied opacity
        speed: Math.random() * 0.05 + 0.01, // Slower movement for realism
        twinkleSpeed: Math.random() * 0.01 + 0.005, // Speed of twinkling
        twinkleDirection: Math.random() > 0.5 ? 1 : -1, // Direction of opacity change
      })
    }

    // Animation function
    const animate = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw stars with twinkling effect
      stars.forEach((star, i) => {
        // Update star opacity for twinkling
        star.opacity += star.twinkleSpeed * star.twinkleDirection
        if (star.opacity > 1) {
          star.opacity = 1
          star.twinkleDirection = -1
        } else if (star.opacity < 0.2) {
          star.opacity = 0.2
          star.twinkleDirection = 1
        }

        // Draw star
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fill()

        // Move stars very slightly for subtle movement
        stars[i].y += star.speed

        // Reset stars that go off screen
        if (star.y > canvas.height) {
          stars[i].y = 0
          stars[i].x = Math.random() * canvas.width
        }
      })

      // Occasionally add a shooting star effect (more rare and subtle)
      if (Math.random() < 0.005) {
        const shootingStar = {
          x: Math.random() * canvas.width,
          y: 0,
          length: Math.random() * 50 + 20,
          speed: Math.random() * 5 + 3,
          angle: Math.PI / 4 + (Math.random() * Math.PI) / 4,
        }

        ctx.beginPath()
        ctx.moveTo(shootingStar.x, shootingStar.y)
        const endX = shootingStar.x + Math.cos(shootingStar.angle) * shootingStar.length
        const endY = shootingStar.y + Math.sin(shootingStar.angle) * shootingStar.length
        ctx.lineTo(endX, endY)

        const gradient = ctx.createLinearGradient(shootingStar.x, shootingStar.y, endX, endY)
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.7)")
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

        ctx.strokeStyle = gradient
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

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

  // Enhanced transition when clicking "Enter Dreamspace"
  const completeAnimation = () => {
    if (isTransitioning) return // Prevent multiple clicks

    setIsTransitioning(true)

    // Set a timeout to match the exit animation duration
    setTimeout(() => {
      sessionStorage.setItem("hasSeenIntro", "true")
      setShowAnimation(false)

      // Add a small delay before enabling scroll to ensure smooth transition
      setTimeout(() => {
        document.body.style.overflow = "auto"
      }, 100)
    }, 1800) // Increased duration for smoother transition
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
              duration: 1.8, // Increased for smoother transition
              ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for smooth transition
            },
          }}
        >
          {/* Stars canvas */}
          <canvas ref={canvasRef} className="absolute inset-0" />

          {/* Subtle radial gradient for depth */}
          <div className="absolute inset-0 bg-radial-gradient pointer-events-none"></div>

          <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
            {/* Logo animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={
                isTransitioning
                  ? {
                      scale: 1.2,
                      opacity: 0,
                      transition: { duration: 1.5 }, // Increased for smoother transition
                    }
                  : {}
              }
              transition={{ duration: 1.5, ease: "easeOut" }}
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={
                  isTransitioning
                    ? {
                        y: -20,
                        opacity: 0,
                        transition: { duration: 1.0 }, // Increased for smoother transition
                      }
                    : {}
                }
                transition={{ delay: 0.8, duration: 0.8 }}
                className="mb-4"
              >
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Black%20And%20White%20Aesthetic%20Minimalist%20Modern%20Simple%20Typography%20Coconut%20Cosmetics%20Logo-FZR2TAaloYcD1POFPvJs3NQNIRpJXf.png"
                  alt="dreamspace"
                  className="h-20 mx-auto"
                />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={
                  isTransitioning
                    ? {
                        y: -20,
                        opacity: 0,
                        transition: { duration: 0.8, delay: 0.1 },
                      }
                    : {}
                }
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-3xl md:text-4xl font-light text-white mb-8"
              >
                Where dreams become <span className="font-medium">design</span>
              </motion.h1>

              {/* Enhanced modern button with star-themed hover effects */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={
                  isTransitioning
                    ? {
                        y: 20,
                        opacity: 0,
                        scale: 0.9,
                        transition: { duration: 0.7, delay: 0.2 },
                      }
                    : {}
                }
                transition={{ delay: 1.6, duration: 0.8 }}
                onClick={completeAnimation}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                className="relative px-10 py-4 bg-transparent text-white rounded-full font-medium text-lg transition-all duration-500 overflow-hidden group border border-white/20"
                disabled={isTransitioning}
              >
                {/* Button background with star-like particles */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-blue-600/80 to-blue-400/80 transition-opacity duration-500 ${
                    isButtonHovered ? "opacity-100" : "opacity-0"
                  }`}
                ></div>

                {/* Animated particles inside button on hover */}
                {isButtonHovered && !isTransitioning && (
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        initial={{
                          x: Math.random() * 100 + 50,
                          y: Math.random() * 40 + 10,
                          opacity: 0,
                        }}
                        animate={{
                          x: [null, Math.random() * 200],
                          y: [null, Math.random() * 60 - 10],
                          opacity: [0, 0.8, 0],
                        }}
                        transition={{
                          duration: 1 + Math.random(),
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "loop",
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Button glow effect */}
                <div
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    isButtonHovered ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    boxShadow: "0 0 20px 5px rgba(59, 130, 246, 0.3)",
                  }}
                ></div>

                {/* Button text with subtle animation */}
                <span className="relative z-10 flex items-center justify-center">
                  <span className={`transition-transform duration-500 ${isButtonHovered ? "scale-110" : "scale-100"}`}>
                    Enter Dreamspace
                  </span>
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ml-2 transition-all duration-500 ${
                      isButtonHovered ? "translate-x-1 opacity-100" : "opacity-70"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </motion.svg>
                </span>
              </motion.button>
            </div>
          </div>

          {/* Enhanced transition overlay with radial gradient for a more dramatic effect */}
          {isTransitioning && (
            <motion.div
              className="absolute inset-0 z-20 bg-black"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                background: [
                  "radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)",
                  "radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,1) 100%)",
                  "rgba(0,0,0,1)",
                ],
              }}
              transition={{
                duration: 1.5,
                delay: 0.3,
                times: [0, 0.5, 1],
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
