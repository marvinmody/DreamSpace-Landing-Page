import Hero from "@/components/hero"
import About from "@/components/about"
import Features from "@/components/features"
import InteractiveDemoSection from "@/components/interactive-demo-section"
import Footer from "@/components/footer"
import WelcomeAnimation from "@/components/welcome-animation"
import Navbar from "@/components/navbar"

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <WelcomeAnimation />
      <Navbar />
      <Hero />
      <About />
      <Features />
      <InteractiveDemoSection />
      <Footer />
    </main>
  )
}
