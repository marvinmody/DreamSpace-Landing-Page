"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, ChevronDown } from "lucide-react"

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const { scrollY } = useScroll()
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  // Parallax effect for content
  const contentY = useTransform(scrollY, [0, 500], [0, 100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  // Handle video loaded state
  useEffect(() => {
    const videoElement = document.getElementById("earth-video") as HTMLVideoElement
    if (videoElement) {
      videoElement.play().catch((error) => {
        console.error("Video play failed:", error)
        setIsVideoLoaded(true) // Show content even if video fails
      })
    }

    // Set loaded to true after a timeout as fallback
    const timer = setTimeout(() => {
      setIsVideoLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Smooth scroll function
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section ref={heroRef} id="home" className="relative min-h-screen overflow-hidden">
      {/* Earth video background */}
      <div className="absolute inset-0 w-full h-full z-0">
        {/* Video overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/30 z-10"></div>

        {/* Loading placeholder until video loads */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/30 to-blue-900/20 z-5 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {/* Earth video */}
        <video
          id="earth-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedData={() => setIsVideoLoaded(true)}
        >
          <source src="/earth-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        >
          <source src="/earth-from-space.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Subtle overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-blue-900/90 z-10"></div>

      {/* Content container */}
      <motion.div
        className="container relative z-20 mx-auto px-4 pt-40 pb-20 flex flex-col items-center justify-center min-h-screen text-white"
        style={{ y: contentY, opacity }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.1, 0.9, 0.2, 1] }}
            className="mb-6"
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design-4DqE0K5GAvZaNDFrySNIUiqsOVhKg9.gif"
              alt="DreamSpace Logo"
              className="h-28 md:h-32 mx-auto object-contain"
            />
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.1, 0.9, 0.2, 1] }}
            className="mb-6"
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Black%20And%20White%20Aesthetic%20Minimalist%20Modern%20Simple%20Typography%20Coconut%20Cosmetics%20Logo-FZR2TAaloYcD1POFPvJs3NQNIRpJXf.png"
              alt="dreamspace"
              className="h-16 md:h-20 mx-auto invert"
            />
            <h2
              className="text-3xl md:text-4xl text-white/90 mt-3 font-light tracking-wider"
              style={{ fontFamily: "'Raleway', sans-serif", letterSpacing: "0.15em" }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white font-bold">
                DESIGN YOUR REALITY
              </span>
            </h2>
          </motion.div>

          {/* Subheadline - Larger text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.1, 0.9, 0.2, 1] }}
            className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed tracking-wide"
            style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.05em", fontWeight: 300 }}
          >
            Transform your living spaces with AI-powered design. Visualize, customize, and bring your interior dreams to
            life with stunning precision.
          </motion.p>

          {/* CTA Buttons - Enhanced with modern design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.7, ease: [0.1, 0.9, 0.2, 1] }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <button
              onClick={() => window.open("https://dreamspace-liard.vercel.app/", "_blank")}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-full overflow-hidden shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
            >
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-blue-500 rounded-full group-hover:w-full group-hover:h-56"></span>
              <span className="relative flex items-center">
                Try It Now
                <ArrowRight className={`ml-2 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`} />
              </span>
            </button>

            <button
              onClick={() => scrollToSection("about")}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-transparent border-2 border-white/50 rounded-full overflow-hidden hover:border-white transition-all duration-300"
            >
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white/10 rounded-full group-hover:w-full group-hover:h-56"></span>
              <span className="relative">Learn More</span>
            </button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
            className="cursor-pointer"
            onClick={() => scrollToSection("about")}
          >
            <p className="text-white/70 mb-2 text-sm">Scroll to explore</p>
            <ChevronDown className="h-6 w-6 text-white/70 mx-auto" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
