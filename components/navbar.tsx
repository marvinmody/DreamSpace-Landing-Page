"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const navVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.1, 0.9, 0.2, 1],
      delay: 0.2,
    },
  },
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Smooth scroll function
  const scrollToSection = (id: string) => {
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <motion.header
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/90 backdrop-blur-md shadow-lg py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo - Now scrolls to top when clicked */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => scrollToSection("home")}>
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design-4DqE0K5GAvZaNDFrySNIUiqsOVhKg9.gif"
              alt="DreamSpace"
              className="h-10 w-10"
            />
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Black%20And%20White%20Aesthetic%20Minimalist%20Modern%20Simple%20Typography%20Coconut%20Cosmetics%20Logo-FZR2TAaloYcD1POFPvJs3NQNIRpJXf.png"
              alt="dreamspace"
              className="h-8 hidden sm:block invert"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("home")}
              className="text-white hover:text-white/80 transition-colors font-medium"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-white hover:text-white/80 transition-colors font-medium"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-white hover:text-white/80 transition-colors font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("demo")}
              className="text-white hover:text-white/80 transition-colors font-medium"
            >
              Demo
            </button>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button
              onClick={() => window.open("https://dreamspace-liard.vercel.app/", "_blank")}
              className="bg-transparent border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white rounded-full px-6 font-medium transition-all duration-300 relative overflow-hidden"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-black/95 backdrop-blur-lg"
          >
            <div className="container mx-auto px-4 py-6">
              <nav className="flex flex-col space-y-4">
                <button
                  onClick={() => scrollToSection("home")}
                  className="text-white hover:text-white/80 transition-colors font-medium py-2 text-left"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-white hover:text-white/80 transition-colors font-medium py-2 text-left"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-white hover:text-white/80 transition-colors font-medium py-2 text-left"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("demo")}
                  className="text-white hover:text-white/80 transition-colors font-medium py-2 text-left"
                >
                  Demo
                </button>
                <Button
                  className="bg-transparent border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white rounded-full px-6 font-medium w-full mt-2 transition-all duration-300"
                  onClick={() => window.open("https://dreamspace-liard.vercel.app/", "_blank")}
                >
                  Get Started
                </Button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
