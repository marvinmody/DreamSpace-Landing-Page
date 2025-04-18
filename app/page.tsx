"use client"

import Hero from "@/components/hero"
import About from "@/components/about"
import Features from "@/components/features"
import InteractiveDemoSection from "@/components/interactive-demo-section"
import Footer from "@/components/footer"
import WelcomeAnimation from "@/components/welcome-animation"
import Navbar from "@/components/navbar"
import { motion } from "framer-motion"
import { useEffect } from "react"

export default function Home() {
  // Add console logging to help diagnose issues
  useEffect(() => {
    console.log("Home component mounted")

    // Check if the video file exists by fetching it
    fetch("/videos/background-video.mp4", { method: "HEAD" })
      .then((response) => {
        console.log("Local video file fetch response:", response.status, response.statusText)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response
      })
      .then(() => {
        console.log("Local video file is accessible")
      })
      .catch((error) => {
        console.error("Error checking local video file:", error)

        // If local file fails, check the remote URL
        fetch(
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/28531-370317126_small-efAOZ3th4YEzId3AmiwLzgzefN1hsI.mp4",
          { method: "HEAD" },
        )
          .then((response) => {
            console.log("Remote video file fetch response:", response.status, response.statusText)
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`)
            }
            console.log("Remote video file is accessible")
          })
          .catch((remoteError) => {
            console.error("Error checking remote video file:", remoteError)
          })
      })

    // Preload the video files
    const videoUrls = [
      "/videos/background-video.mp4",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/28531-370317126_small-efAOZ3th4YEzId3AmiwLzgzefN1hsI.mp4",
    ]

    const preloadLinks = videoUrls.map((url) => {
      const link = document.createElement("link")
      link.rel = "preload"
      link.href = url
      link.as = "video"
      link.type = "video/mp4"
      document.head.appendChild(link)
      return link
    })

    return () => {
      preloadLinks.forEach((link) => {
        document.head.removeChild(link)
      })
    }
  }, [])

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
