"use client"

import { motion } from "framer-motion"
import { LayoutGrid, Sofa, Wand2 } from "lucide-react"
import ParallaxSection from "./parallax-section"

export default function ParallaxAbout() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <ParallaxSection id="about" className="py-16 bg-white">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-dreamspace-charcoal mb-4">About the Platform</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            DreamSpace Designer combines interactive 3D isometric design with AI to revolutionize how you visualize and
            create your ideal spaces.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          <motion.div
            variants={item}
            className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow transform-gpu hover:translate-y-[-5px] duration-300"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-dreamspace-navy/10 rounded-full flex items-center justify-center">
                <LayoutGrid className="w-8 h-8 text-dreamspace-navy" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-4">3D Isometric Views</h3>
            <p className="text-gray-600 text-center">
              Explore interactive 3D isometric views of real estate spaces with photorealistic rendering and lighting.
            </p>
          </motion.div>

          <motion.div
            variants={item}
            className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow transform-gpu hover:translate-y-[-5px] duration-300"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-dreamspace-navy/10 rounded-full flex items-center justify-center">
                <Sofa className="w-8 h-8 text-dreamspace-navy" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-4">Drag & Drop Furniture</h3>
            <p className="text-gray-600 text-center">
              Reimagine rooms by dragging and dropping furniture with intuitive controls for rotation and resizing.
            </p>
          </motion.div>

          <motion.div
            variants={item}
            className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow transform-gpu hover:translate-y-[-5px] duration-300"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-dreamspace-navy/10 rounded-full flex items-center justify-center">
                <Wand2 className="w-8 h-8 text-dreamspace-navy" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-4">AI-Powered Design</h3>
            <p className="text-gray-600 text-center">
              Let AI design spaces based on your prompts with photorealistic results and instant style transformations.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </ParallaxSection>
  )
}
