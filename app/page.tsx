"use client"

import Hero from "@/components/hero"
import About from "@/components/about"
import Features from "@/components/features"
import InteractiveDemoSection from "@/components/interactive-demo-section"
import Footer from "@/components/footer"
import WelcomeAnimation from "@/components/welcome-animation"
import Navbar from "@/components/navbar"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <motion.main
      className="min-h-screen bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: [0.1, 0.9, 0.2, 1] }}
    >
      <WelcomeAnimation />
      <Navbar />
      <Hero />
      <About />
      <Features />
      <InteractiveDemoSection />
      <Footer />
    </motion.main>
  )
}
