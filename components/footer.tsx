"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Github, Mail, MapPin, Phone, ArrowUp } from "lucide-react"

export default function Footer() {
  // Smooth scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-black text-white pt-20 pb-10 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-900/20 to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Top section with logo and social links */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 border-b border-white/10 pb-8">
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

          <div className="flex space-x-1">
            {[
              { icon: <Facebook size={18} />, label: "Facebook" },
              { icon: <Twitter size={18} />, label: "Twitter" },
              { icon: <Instagram size={18} />, label: "Instagram" },
              { icon: <Linkedin size={18} />, label: "LinkedIn" },
              { icon: <Github size={18} />, label: "GitHub" },
            ].map((social, index) => (
              <Link
                key={index}
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-blue-600 hover:scale-110 transition-all duration-300 text-white/70 hover:text-white"
                aria-label={social.label}
              >
                {social.icon}
              </Link>
            ))}
          </div>
        </div>

        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white relative inline-block">
              About Us
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-500 rounded-full"></span>
            </h3>
            <p className="text-white/60 mb-6 leading-relaxed">
              DreamSpace transforms interior design with AI-powered tools and interactive 3D visualization. Create,
              customize, and bring your dream spaces to life.
            </p>
            <button
              onClick={scrollToTop}
              className="group flex items-center text-white/60 hover:text-blue-400 transition-colors"
            >
              <span className="mr-2">Back to top</span>
              <ArrowUp className="h-4 w-4 group-hover:-translate-y-1 transition-transform duration-300" />
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-white relative inline-block">
              Product
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-500 rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              {["Features", "Pricing", "Templates", "Gallery", "Showcase", "Updates"].map((item, index) => (
                <li key={index}>
                  <Link
                    href="#"
                    className="text-white/60 hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <span className="w-0 h-0.5 bg-blue-400 mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-300"></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-white relative inline-block">
              Resources
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-500 rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              {["Documentation", "Tutorials", "Blog", "Support", "Community", "API"].map((item, index) => (
                <li key={index}>
                  <Link
                    href="#"
                    className="text-white/60 hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <span className="w-0 h-0.5 bg-blue-400 mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-300"></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-white relative inline-block">
              Contact
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-500 rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={18} className="mr-3 text-blue-400 mt-1 flex-shrink-0" />
                <span className="text-white/60">123 Design Street, Creative City, 10001</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-3 text-blue-400 flex-shrink-0" />
                <span className="text-white/60">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-3 text-blue-400 flex-shrink-0" />
                <span className="text-white/60">hello@dreamspace.design</span>
              </li>
            </ul>

            {/* Newsletter signup */}
            <div className="mt-6 bg-white/5 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white mb-2">Subscribe to our newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-white/10 border border-white/10 rounded-l-md px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-r-md px-3 py-2 text-sm transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section with copyright */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-white/40 text-sm">
          <p>&copy; {new Date().getFullYear()} DreamSpace. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-blue-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-blue-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-blue-400 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
