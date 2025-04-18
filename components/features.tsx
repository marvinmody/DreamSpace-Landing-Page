"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Zap, Layers, PenTool, Palette, LayoutGrid, Users } from "lucide-react"

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }

  const features = [
    {
      icon: <Zap className="h-6 w-6 text-blue-500" />,
      title: "AI-Powered Design",
      description: "Our advanced AI analyzes your preferences and suggests personalized design options.",
    },
    {
      icon: <Layers className="h-6 w-6 text-blue-500" />,
      title: "3D Visualization",
      description: "See your designs come to life with realistic 3D rendering and interactive viewing.",
    },
    {
      icon: <PenTool className="h-6 w-6 text-blue-500" />,
      title: "Customizable Templates",
      description: "Start with professional templates and customize every detail to match your vision.",
    },
    {
      icon: <Palette className="h-6 w-6 text-blue-500" />,
      title: "Color Harmony",
      description: "Intelligent color suggestions ensure your space has perfect color harmony.",
    },
    {
      icon: <LayoutGrid className="h-6 w-6 text-blue-500" />,
      title: "Space Planning",
      description: "Optimize your layout with smart space planning tools and suggestions.",
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: "Collaboration",
      description: "Share your designs with friends, family, or designers for feedback and collaboration.",
    },
  ]

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-gray-900 to-blue-900">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold text-white mb-4">
            Powerful Features
          </motion.h2>
          <motion.p variants={itemVariants} className="text-xl text-white/80">
            Everything you need to create stunning interior designs
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-white/70 mb-4">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
