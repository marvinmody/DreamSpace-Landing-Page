"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"

interface VideoBackgroundProps {
  src: string
  fallbackSrc: string
  className?: string
}

export default function VideoBackground({ src, fallbackSrc, className = "" }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleCanPlay = () => {
      setIsLoaded(true)
    }

    const handleError = () => {
      console.error("Video failed to load")
      setHasError(true)
      setIsLoaded(true) // Show fallback
    }

    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("error", handleError)

    // Try to play the video
    video.load()

    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Auto-play was prevented:", error)
        setHasError(true)
      })
    }

    // Fallback if video doesn't load within 5 seconds
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        setHasError(true)
        setIsLoaded(true)
      }
    }, 5000)

    return () => {
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("error", handleError)
      clearTimeout(timeout)
    }
  }, [isLoaded])

  return (
    <div className={`relative w-full h-full ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {hasError ? (
        <Image src={fallbackSrc || "/placeholder.svg"} alt="Video fallback" fill priority className="object-cover" />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={fallbackSrc}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={src} type="video/mp4" />
          <source
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/earth-from-space-9Yd9Iy9Yd9Iy.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  )
}
