"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, MousePointer, Wand2, Layers, ChevronDown } from "lucide-react"
import dynamic from "next/dynamic"

// Import the interactive room with no SSR
const EnhancedIsometricRoom = dynamic(() => import("@/components/enhanced-isometric-room"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  ),
})

export default function ParallaxHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isTaglineHovered, setIsTaglineHovered] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  // Update scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Simple parallax calculation
  const getParallaxY = (factor: number) => {
    return scrollY * factor
  }

  const scrollToDemo = () => {
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-gray-50 to-blue-50"
    >
      {/* Parallax background elements */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ transform: `translateY(${getParallaxY(-0.1)}px)` }}
      >
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/10"></div>
        <div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl animate-pulse"
          style={{ animationDuration: "8s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl animate-pulse"
          style={{ animationDuration: "10s" }}
        ></div>
      </div>

      {/* Parallax grid pattern */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(12,74,110,0.05)_1px,transparent_1px)] bg-[length:24px_24px]"
        style={{ transform: `translateY(${getParallaxY(-0.05)}px)` }}
      ></div>

      {/* Parallax floating elements */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ transform: `translateY(${getParallaxY(-0.15)}px)` }}
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-lg bg-white shadow-md"
            style={{
              width: Math.random() * 60 + 40,
              height: Math.random() * 60 + 40,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.4,
              rotate: Math.random() * 45,
              background: i % 3 === 0 ? "linear-gradient(135deg, rgba(12,74,110,0.1), rgba(15,118,110,0.1))" : "white",
              border: i % 3 === 0 ? "1px solid rgba(12,74,110,0.2)" : "1px solid rgba(229,231,235,0.5)",
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [Math.random() * 45, Math.random() * 45 + 10],
              opacity: [0.4, 0.6, 0.4],
              boxShadow: ["0 4px 12px rgba(0,0,0,0.05)", "0 8px 20px rgba(0,0,0,0.1)", "0 4px 12px rgba(0,0,0,0.05)"],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 md:px-6 pt-32 pb-16 relative z-10">
        <motion.div
          className="flex flex-col items-center text-center"
          style={{
            opacity: Math.max(0, 1 - scrollY / 500),
            transform: `scale(${Math.max(0.9, 1 - scrollY / 2000)})`,
          }}
        >
          {/* Logo and brand */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-2 relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative w-64 h-64 mx-auto cursor-pointer transition-transform duration-300 hover:scale-105">
              <img
                src="/ethereal-vortex.png"
                alt="DreamSpace Logo"
                width="256"
                height="256"
                className="w-full h-full object-contain relative z-10"
                style={{
                  opacity: 1,
                  filter: "contrast(1.05)",
                  animation: isHovered ? "none" : "paused",
                  WebkitAnimation: isHovered ? "none" : "paused",
                }}
              />
            </div>
          </motion.div>

          {/* Main headline with effects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative mb-3"
          >
            <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 rounded-3xl blur-xl"></div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight">
              dream<span className="text-blue-600">space</span>
            </h1>
            {/* Hover effect */}
            <div className="mt-3 relative">
              <span
                className="block text-2xl md:text-3xl text-gray-800 font-semibold relative z-10 tracking-wide cursor-pointer"
                onMouseEnter={() => setIsTaglineHovered(true)}
                onMouseLeave={() => setIsTaglineHovered(false)}
              >
                <span
                  className="bg-gradient-to-r transition-all duration-1000 ease-in-out bg-clip-text text-transparent bg-size-200"
                  style={{
                    backgroundImage: isTaglineHovered
                      ? "linear-gradient(to right, #0c4a6e, #15766e, #0c4a6e)"
                      : "linear-gradient(to right, #0c4a6e, #0c4a6e, #15766e, #0c4a6e, #0c4a6e)",
                    backgroundPosition: isTaglineHovered ? "100% 0" : "0 0",
                  }}
                >
                  Design Your Reality
                </span>
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0 rounded-full blur-sm"></div>
            </div>
          </motion.div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-gray-700 max-w-2xl mx-auto mb-6 leading-relaxed font-light"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
          >
            Transform your living spaces with AI-powered design. Visualize, customize, and bring your interior dreams to
            life with stunning precision and creativity.
          </motion.p>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-gray-100 transition-all duration-500 hover:shadow-xl hover:scale-105 hover:bg-gradient-to-b hover:from-white hover:to-blue-500/5 group">
              <div className="bg-blue-500/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:bg-blue-500/20 group-hover:scale-110">
                <Wand2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-blue-600 text-lg mb-2 group-hover:text-blue-700">AI-Powered Design</h3>
              <p className="text-gray-600 text-sm group-hover:text-gray-700">
                Intelligent design suggestions tailored to your unique style and preferences
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-gray-100 transition-all duration-500 hover:shadow-xl hover:scale-105 hover:bg-gradient-to-b hover:from-white hover:to-emerald-500/5 group">
              <div className="bg-emerald-500/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:bg-emerald-500/20 group-hover:scale-110">
                <Layers className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-emerald-600 text-lg mb-2 group-hover:text-emerald-700">3D Visualization</h3>
              <p className="text-gray-600 text-sm group-hover:text-gray-700">
                See your designs come to life in interactive 3D with realistic lighting and textures
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-gray-100 transition-all duration-500 hover:shadow-xl hover:scale-105 hover:bg-gradient-to-b hover:from-white hover:to-gray-500/5 group">
              <div className="bg-gray-500/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:bg-gray-500/20 group-hover:scale-110">
                <MousePointer className="h-6 w-6 text-gray-700" />
              </div>
              <h3 className="font-bold text-gray-700 text-lg mb-2 group-hover:text-gray-800">Intuitive Interface</h3>
              <p className="text-gray-600 text-sm group-hover:text-gray-700">
                Easily customize every aspect of your space with our drag-and-drop interface
              </p>
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-5 mb-12"
          >
            <Button
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg py-6 px-10 rounded-xl shadow-lg transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl border border-blue-500/10 group"
              onClick={scrollToDemo}
            >
              <span className="relative">
                Try It Now
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-white/40 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50 text-lg py-6 px-10 rounded-xl transition-all duration-300 hover:shadow-md group"
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            >
              <span className="relative">
                Learn More
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-500/40 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-16 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{
            opacity: { delay: 2, duration: 1 },
            y: { repeat: Number.POSITIVE_INFINITY, duration: 1.5 },
          }}
        >
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-b from-blue-500/10 to-transparent rounded-full blur-md"></div>
            <p className="text-blue-600/80 mb-2 text-sm font-medium relative">Scroll to explore more</p>
            <ChevronDown className="h-6 w-6 text-blue-600/80 relative" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
