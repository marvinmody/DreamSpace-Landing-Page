"use client"

import { motion } from "framer-motion"
import EnhancedLivingRoom from "./enhanced-living-room"

export default function InteractiveDemoSection() {
  return (
    <section id="demo" className="py-20 bg-gradient-to-b from-blue-800 to-blue-900 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] bg-repeat opacity-20"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Design Your Dream Space</h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Explore our interactive 3D room visualization and see how DreamSpace can transform your ideas into reality.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Room visualization */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:col-span-8 bg-blue-800/30 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-700/30 relative"
            style={{
              boxShadow: "0 0 40px rgba(59, 130, 246, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-blue-100">Living Room Designer</h3>
            </div>
            <div className="h-[550px] rounded-xl overflow-hidden">
              <EnhancedLivingRoom />
            </div>
          </motion.div>

          {/* Info and controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Information card */}
            <div className="bg-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-blue-700/30 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-blue-100">About This Demo</h3>
              <p className="text-blue-200 mb-4">
                This interactive 3D room visualization demonstrates how DreamSpace creates detailed models based on
                properties observed from around the world.
              </p>
              <div className="bg-blue-700/30 rounded-lg p-4 border border-blue-600/30">
                <h4 className="font-medium text-blue-100 mb-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-blue-300"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Navigation Instructions
                </h4>
                <ul className="text-sm text-blue-200 space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-300 mr-2">•</span>
                    Click on furniture to select it
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-300 mr-2">•</span>
                    Drag selected furniture to rearrange the room
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-300 mr-2">•</span>
                    Use the green circle to rotate furniture
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-300 mr-2">•</span>
                    Press 'E' to toggle edit mode
                  </li>
                </ul>
              </div>
            </div>

            {/* Features highlight */}
            <div className="bg-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-blue-700/30 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-blue-100">Key Features</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-blue-600 rounded-full p-1 mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-100">Interactive Furniture</h4>
                    <p className="text-sm text-blue-200">Select and move furniture to create your perfect layout</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-600 rounded-full p-1 mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-100">Realistic Lighting</h4>
                    <p className="text-sm text-blue-200">Dynamic lighting creates a warm, inviting atmosphere</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-600 rounded-full p-1 mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-100">Detailed Visualization</h4>
                    <p className="text-sm text-blue-200">Explore every detail of your potential dream space</p>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
