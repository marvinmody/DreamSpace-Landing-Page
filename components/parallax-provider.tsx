"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface ParallaxContextType {
  scrollY: number
}

const ParallaxContext = createContext<ParallaxContextType>({ scrollY: 0 })

export const useParallax = () => useContext(ParallaxContext)

interface ParallaxProviderProps {
  children: ReactNode
}

export default function ParallaxProvider({ children }: ParallaxProviderProps) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    // Set initial scroll position
    setScrollY(window.scrollY)

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return <ParallaxContext.Provider value={{ scrollY }}>{children}</ParallaxContext.Provider>
}
