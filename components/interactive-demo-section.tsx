"use client"

import { motion } from "framer-motion"
import EnhancedIsometricRoom from "./enhanced-isometric-room"

export default function InteractiveDemoSection() {
  return (
    <section
      id="demo"
      className="py-20 bg-gradient-to-b from-blue-950 to-indigo-950 text-white relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] bg-repeat opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400 rounded-full filter blur-[100px] opacity-20"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-400 rounded-full filter blur-[100px] opacity-20"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-cyan-400 rounded-full filter blur-[120px] opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-3 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">
              Interactive Room Designer
            </span>
          </h2>
          <p className="text-lg text-blue-200/90 max-w-2xl mx-auto font-light">
            Experience the future of interior design. Arrange furniture, customize your space, and visualize your dream
            home.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, margin: "-200px" }} // Increased margin to load earlier
          className="relative z-10 max-w-6xl mx-auto"
        >
          <div className="rounded-2xl overflow-hidden backdrop-blur-sm border border-white/10 bg-gradient-to-b from-blue-950/40 to-indigo-950/40 shadow-[0_0_25px_rgba(30,64,175,0.15)]">
            <div className="rounded-xl overflow-hidden h-[550px]">
              <EnhancedIsometricRoom autoInitialize={true} />
            </div>
          </div>

          {/* Feature highlights below the room */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <FeatureCard
              icon="layout-grid"
              title="Intuitive Design"
              description="Drag and drop furniture with ease to create your perfect space."
            />
            <FeatureCard
              icon="settings"
              title="Full Customization"
              description="Rotate and position items exactly where you want them."
            />
            <FeatureCard
              icon="eye"
              title="Realistic Preview"
              description="See how your design choices would look in a real environment."
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      viewport={{ once: true }}
      className="bg-blue-900/20 backdrop-blur-sm border border-blue-700/20 p-5 rounded-xl interactive"
    >
      <div className="flex items-start">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-lg mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {icon === "layout-grid" && (
              <>
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </>
            )}
            {icon === "settings" && (
              <>
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
            {icon === "eye" && (
              <>
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
          <p className="text-sm text-blue-200/80">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}
