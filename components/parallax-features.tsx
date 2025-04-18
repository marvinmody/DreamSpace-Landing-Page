"use client"

import { motion } from "framer-motion"
import { Sparkles, Layers } from "lucide-react"
import ParallaxSection from "./parallax-section"

export default function ParallaxFeatures() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <ParallaxSection id="features" className="py-16 bg-gray-50">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-dreamspace-charcoal mb-4">Features Highlight</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the powerful tools that make DreamSpace Designer the ultimate platform for reimagining spaces in
            3D.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {[
            {
              icon: <Sparkles className="w-6 h-6 text-dreamspace-navy" />,
              title: "AI-Powered Design",
              description:
                "Generate room designs based on simple user prompts and preferences with photorealistic results.",
            },
            {
              icon: <Layers className="w-6 h-6 text-dreamspace-navy" />,
              title: "Isometric Room View",
              description:
                "Visualize your room in an isometric perspective for a unique and comprehensive view of your space.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-5px]"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-dreamspace-navy/10 rounded-full flex items-center justify-center">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </ParallaxSection>
  )
}
