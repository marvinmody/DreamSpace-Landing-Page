"use client"

import Link from "next/link"
import { ArrowUp, Linkedin } from "lucide-react"

export default function Footer() {
  // Smooth scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-black text-white pt-16 pb-10 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-900/20 to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Top section with logo and back to top */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-white/10 pb-8">
          <div className="flex items-center mb-6 md:mb-0">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design-4DqE0K5GAvZaNDFrySNIUiqsOVhKg9.gif"
              alt="DreamSpace"
              className="h-12 w-12 mr-3"
            />
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Black%20And%20White%20Aesthetic%20Minimalist%20Modern%20Simple%20Typography%20Coconut%20Cosmetics%20Logo-FZR2TAaloYcD1POFPvJs3NQNIRpJXf.png"
              alt="dreamspace"
              className="h-8 invert"
            />
          </div>

          <button
            onClick={scrollToTop}
            className="group flex items-center text-white/70 hover:text-blue-400 transition-colors bg-white/5 px-4 py-2 rounded-full interactive"
          >
            <span className="mr-2">Back to top</span>
            <ArrowUp className="h-4 w-4 group-hover:-translate-y-1 transition-transform duration-300" />
          </button>
        </div>

        {/* Simplified footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white relative inline-block">
              About Us
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-500 rounded-full"></span>
            </h3>
            <p className="text-white/60 mb-6 leading-relaxed">
              DreamSpace transforms interior design with AI-powered tools and interactive 3D visualization. Create,
              customize, and bring your dream spaces to life.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-white relative inline-block">
              Our Team
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-500 rounded-full"></span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center group">
                <Link
                  href="https://www.linkedin.com/in/marvinrm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-white/60 hover:text-blue-400 transition-colors interactive"
                >
                  <Linkedin size={18} className="mr-3 text-blue-400 flex-shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Marvin Mody</span>
                </Link>
              </div>
              <div className="flex items-center group">
                <Link
                  href="https://www.linkedin.com/in/ryan-johnson-559b822b6/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-white/60 hover:text-blue-400 transition-colors interactive"
                >
                  <Linkedin size={18} className="mr-3 text-blue-400 flex-shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Ryan Johnson</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section with copyright */}
        <div className="mt-12 pt-8 border-t border-white/10 flex justify-center items-center text-white/40 text-sm">
          <p>&copy; {new Date().getFullYear()} DreamSpace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
