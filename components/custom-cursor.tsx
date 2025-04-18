"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [starTrail, setStarTrail] = useState<
    {
      x: number
      y: number
      size: number
      opacity: number
      id: number
      color: string
    }[]
  >([])
  const [isOverInteractive, setIsOverInteractive] = useState(false)
  const trailIdRef = useRef(0)
  const lastPositionRef = useRef({ x: 0, y: 0, time: 0 })
  const targetPositionRef = useRef({ x: 0, y: 0 })
  const currentPositionRef = useRef({ x: 0, y: 0 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const requestRef = useRef<number>()
  const interactiveElements = ["a", "button", '[role="button"]', "input", "select", "textarea", ".interactive"]

  // Add cursor styles to document
  useEffect(() => {
    // Add the cursor-none class to the body
    document.body.classList.add("cursor-none")

    // Add a style for all interactive elements
    interactiveElements.forEach((selector) => {
      const elements = document.querySelectorAll(selector)
      elements.forEach((el) => {
        el.classList.add("interactive")
      })
    })

    return () => {
      document.body.classList.remove("cursor-none")
    }
  }, [])

  // Check if mouse is over interactive element
  useEffect(() => {
    const checkIfOverInteractive = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Check if the element or any of its parents match our interactive selectors
      const isInteractive = interactiveElements.some((selector) => {
        return target.matches(selector) || !!target.closest(selector)
      })

      setIsOverInteractive(isInteractive)
    }

    document.addEventListener("mousemove", checkIfOverInteractive)

    return () => {
      document.removeEventListener("mousemove", checkIfOverInteractive)
    }
  }, [])

  // Enhanced smooth cursor movement with dynamic trail
  useEffect(() => {
    // Track mouse position for target
    const handleMouseMove = (e: MouseEvent) => {
      targetPositionRef.current = { x: e.clientX, y: e.clientY }
    }

    // Animation loop for smooth cursor movement
    const animateCursor = (time: number) => {
      if (!lastPositionRef.current.time) {
        lastPositionRef.current.time = time
        requestRef.current = requestAnimationFrame(animateCursor)
        return
      }

      const deltaTime = time - lastPositionRef.current.time
      lastPositionRef.current.time = time

      // Calculate distance to target
      const dx = targetPositionRef.current.x - currentPositionRef.current.x
      const dy = targetPositionRef.current.y - currentPositionRef.current.y

      // Smooth follow with subtle easing
      // Lower values = smoother but more lag, higher values = more responsive but potentially jittery
      const easing = 0.18

      // Update current position with easing
      currentPositionRef.current.x += dx * easing
      currentPositionRef.current.y += dy * easing

      // Update velocity for trail effect
      velocityRef.current.x = dx * easing
      velocityRef.current.y = dy * easing

      // Update React state for rendering the main cursor
      setMousePosition({
        x: currentPositionRef.current.x,
        y: currentPositionRef.current.y,
      })

      // Add to trail with dynamic spacing based on velocity
      const speed = Math.sqrt(dx * dx + dy * dy)
      const now = Date.now()

      // Throttle based on speed and time since last trail point
      if (now - lastPositionRef.current.x > (speed > 5 ? 10 : 20)) {
        // Generate trail colors based on interactive state
        const baseColor = isOverInteractive ? "#60a5fa" : "#ffffff"
        const trailColor = isOverInteractive
          ? `rgba(96, 165, 250, ${Math.min(0.8, 0.3 + speed * 0.01)})`
          : `rgba(255, 255, 255, ${Math.min(0.6, 0.2 + speed * 0.01)})`

        const newStar = {
          x: currentPositionRef.current.x,
          y: currentPositionRef.current.y,
          // Dynamic size based on speed and hover state
          size: isOverInteractive ? 3 + Math.min(speed * 0.05, 2) : 2 + Math.min(speed * 0.03, 1.5),
          // Dynamic opacity based on speed
          opacity: isOverInteractive ? 0.7 : 0.5,
          id: trailIdRef.current++,
          color: trailColor,
        }

        setStarTrail((prev) => {
          // Dynamic trail length based on speed and hover state
          const maxTrail = isOverInteractive
            ? 12 + Math.min(Math.floor(speed * 0.3), 8)
            : 8 + Math.min(Math.floor(speed * 0.2), 5)
          return [...prev, newStar].slice(-maxTrail)
        })

        lastPositionRef.current.x = now
      }

      requestRef.current = requestAnimationFrame(animateCursor)
    }

    window.addEventListener("mousemove", handleMouseMove)
    requestRef.current = requestAnimationFrame(animateCursor)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [isOverInteractive])

  // Enhanced trail fade effect
  useEffect(() => {
    if (starTrail.length === 0) return

    const fadeInterval = setInterval(() => {
      setStarTrail((prev) =>
        prev
          .map((star, index) => {
            // Calculate fade rate based on position in trail
            const fadeRate = index < 3 ? 0.01 : 0.02

            return {
              ...star,
              // Gentle fade for smooth disappearance
              opacity: star.opacity > fadeRate ? star.opacity - fadeRate : 0,
              // Gradually reduce size for trailing effect
              size: star.size > 0.5 ? star.size * 0.98 : star.size,
            }
          })
          .filter((star) => star.opacity > 0),
      )
    }, 16) // 60fps for smooth fading

    return () => clearInterval(fadeInterval)
  }, [starTrail])

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[1000]">
      {/* Trail particles - rendered first so they appear behind the main cursor */}
      {starTrail.map((star, index) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
            opacity: star.opacity,
            transform: `translate(-50%, -50%)`,
            zIndex: 1000,
            filter: index < 3 ? "blur(0.5px)" : "",
            transition: "background-color 0.3s ease",
          }}
        />
      ))}

      {/* Main cursor - enhanced with smooth transitions */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          x: mousePosition.x - 6,
          y: mousePosition.y - 6,
          zIndex: 1001,
        }}
        animate={{
          scale: isOverInteractive ? 1.2 : 1,
        }}
        transition={{
          scale: { duration: 0.2, ease: "easeOut" },
        }}
      >
        <div
          className="flex items-center justify-center transition-all duration-300"
          style={{
            width: "12px",
            height: "12px",
          }}
        >
          <div
            className="rounded-full transition-all duration-300"
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: isOverInteractive ? "rgba(96, 165, 250, 0.9)" : "rgba(255, 255, 255, 0.9)",
              boxShadow: isOverInteractive
                ? "0 0 10px 2px rgba(96, 165, 250, 0.4)"
                : "0 0 8px 1px rgba(255, 255, 255, 0.3)",
              transition: "background-color 0.3s ease, box-shadow 0.3s ease",
            }}
          />
        </div>
      </motion.div>
    </div>
  )
}
