"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [activeImage, setActiveImage] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Sample images with proper paths and descriptions
  const images = [
    {
      src: "/minimalist-loft-living.png",
      alt: "Modern living room design",
      title: "Modern Living",
      description: "Clean lines and minimalist approach for contemporary spaces",
    },
    {
      src: "/minimalist-bedroom-with-city-view.png",
      alt: "Contemporary bedroom design",
      title: "Cozy Bedroom",
      description: "Warm tones and soft textures for ultimate comfort",
    },
    {
      src: "/serene-minimalist-kitchen.png",
      alt: "Minimalist kitchen design",
      title: "Elegant Kitchen",
      description: "Functional elegance with premium materials",
    },
    {
      src: "/serene-spa-bathroom.png",
      alt: "Elegant bathroom design",
      title: "Spa Bathroom",
      description: "Transform your bathroom into a personal spa retreat",
    },
    {
      src: "/inviting-work-nook.png",
      alt: "Cozy home office design",
      title: "Productive Office",
      description: "Ergonomic and inspiring workspace solutions",
    },
    {
      src: "/modern-minimalist-dining.png",
      alt: "Stylish dining room design",
      title: "Dining Experience",
      description: "Create memorable gatherings in a stylish setting",
    },
  ]

  const nextImage = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveImage((prev) => (prev + 1) % images.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const prevImage = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextImage()
    }, 5000)
    return () => clearInterval(interval)
  }, [activeImage])

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

  return (
    <section id="about" className="relative py-24 bg-gradient-to-b from-blue-900 to-blue-800">
      {/* Top gradient transition from hero section */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-900/0 to-blue-900 -mt-32 z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        >
          <source src="/earth-from-space.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Bottom gradient transition to next section */}

      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Text Content */}
          <motion.div variants={itemVariants} className="order-2 lg:order-1">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              About DreamSpace
            </h2>
            <p className="text-xl text-blue-100 mb-6 leading-relaxed">
              DreamSpace is an innovative platform that combines artificial intelligence with interior design to help
              you visualize and create your perfect living space. Our cutting-edge technology allows you to experiment
              with different styles, colors, and furniture arrangements in an isometric environment.
            </p>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Whether you're renovating your home, moving to a new place, or just looking for inspiration, DreamSpace
              provides the tools you need to make informed design decisions with confidence.
            </p>

            {/* Explore Features Button - Enhanced sleek design */}
            <button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="group relative inline-flex items-center overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
            >
              <span className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
              <span className="relative flex items-center">
                <span className="mr-2">Explore Features</span>
                <span className="relative overflow-hidden rounded-full">
                  <span className="absolute inset-0 translate-x-full transition-transform duration-300 group-hover:translate-x-0 bg-white/20"></span>
                  <ChevronRight className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </span>
            </button>
          </motion.div>

          {/* Enhanced Modern Image Stack with 3D effect */}
          <motion.div variants={itemVariants} className="order-1 lg:order-2 relative">
            <div className="relative h-[500px] w-full perspective-1000">
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

              {/* Card stack container */}
              <div className="relative h-full w-full">
                <AnimatePresence>
                  {images.map((image, index) => {
                    // Calculate position based on distance from active image
                    const distance = (index - activeImage + images.length) % images.length
                    const isActive = distance === 0

                    // Only render a few cards for performance
                    if (distance > 2 && distance < images.length - 2) return null

                    // Different transforms based on position
                    let xPosition = "0%"
                    let yPosition = "0%"
                    let scale = 1
                    let opacity = 1
                    const zIndex = images.length - distance
                    let rotate = "0deg"

                    if (!isActive) {
                      opacity = 0.8 - distance * 0.15
                      scale = 1 - distance * 0.05

                      if (distance === 1 || distance === images.length - 1) {
                        xPosition = distance === 1 ? "5%" : "-5%"
                        yPosition = "5%"
                        rotate = distance === 1 ? "2deg" : "-2deg"
                      } else if (distance === 2 || distance === images.length - 2) {
                        xPosition = distance === 2 ? "10%" : "-10%"
                        yPosition = "10%"
                        rotate = distance === 2 ? "4deg" : "-4deg"
                      }
                    }

                    return (
                      <motion.div
                        key={index}
                        className="absolute top-0 left-0 w-full h-full"
                        initial={{ opacity: 0 }}
                        animate={{
                          x: xPosition,
                          y: yPosition,
                          scale,
                          opacity,
                          zIndex,
                          rotate,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                          mass: 1,
                        }}
                      >
                        <div
                          className={`w-full h-full rounded-2xl overflow-hidden shadow-2xl ${isActive ? "ring-4 ring-blue-400/30" : ""}`}
                        >
                          {/* Image */}
                          <div className="relative w-full h-full bg-gray-200">
                            <img
                              src={image.src || "/placeholder.svg"}
                              alt={image.alt}
                              className="w-full h-full object-cover"
                            />

                            {/* Caption overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                              <h3 className="text-2xl font-bold mb-2">{image.title}</h3>
                              <p className="text-white/80">{image.description}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              {/* Navigation controls */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-50">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === activeImage ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>

              {/* Arrow navigation */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-3 transition-all duration-300 border border-white/20"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-3 transition-all duration-300 border border-white/20"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
