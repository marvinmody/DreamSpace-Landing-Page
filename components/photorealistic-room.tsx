"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { RotateCw, Maximize, Minimize, X } from "lucide-react"

type FurnitureItem = {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  color: string
  rotation: number
  zIndex: number
}

export default function PhotorealisticRoom() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [showControls, setShowControls] = useState<string | null>(null)
  const [controlsPosition, setControlsPosition] = useState({ x: 0, y: 0 })
  const [items, setItems] = useState<FurnitureItem[]>([
    { id: "sofa", type: "sofa", x: 50, y: 150, width: 180, height: 80, color: "#3b82f6", rotation: 0, zIndex: 1 },
    { id: "table", type: "table", x: 150, y: 250, width: 100, height: 60, color: "#8b5cf6", rotation: 0, zIndex: 1 },
    { id: "chair1", type: "chair", x: 300, y: 200, width: 50, height: 50, color: "#10b981", rotation: 0, zIndex: 1 },
    { id: "chair2", type: "chair", x: 300, y: 280, width: 50, height: 50, color: "#10b981", rotation: 0, zIndex: 1 },
    { id: "lamp", type: "lamp", x: 50, y: 50, width: 30, height: 30, color: "#f59e0b", rotation: 0, zIndex: 1 },
    { id: "plant", type: "plant", x: 350, y: 50, width: 40, height: 40, color: "#84cc16", rotation: 0, zIndex: 1 },
  ])

  const createRipple = (x: number, y: number) => {
    if (!containerRef.current) return

    const ripple = document.createElement("div")
    ripple.className = "ripple"
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`

    containerRef.current.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  }

  const handleDragEnd = (id: string, x: number, y: number) => {
    createRipple(x, y)

    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, x, y } : item)))
  }

  const handleItemClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveItem(id)
    setShowControls(id)

    // Position controls near the item
    const item = items.find((i) => i.id === id)
    if (item && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setControlsPosition({
        x: item.x - rect.left,
        y: item.y - rect.top - 50,
      })
    }

    // Bring item to front
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, zIndex: 10 } : { ...item, zIndex: 1 })),
    )
  }

  const handleRotate = (id: string) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, rotation: (item.rotation + 45) % 360 } : item)),
    )
  }

  const handleResize = (id: string, increase: boolean) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const scale = increase ? 1.1 : 0.9
          return {
            ...item,
            width: Math.max(20, item.width * scale),
            height: Math.max(20, item.height * scale),
          }
        }
        return item
      }),
    )
  }

  const handleContainerClick = () => {
    setActiveItem(null)
    setShowControls(null)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveItem(null)
        setShowControls(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-white rounded-xl shadow-lg overflow-hidden"
      onClick={handleContainerClick}
    >
      {/* Room floor */}
      <div className="absolute inset-0 room-floor"></div>

      {/* Room walls */}
      <div className="absolute left-0 top-0 bottom-0 w-[200px] room-wall transform origin-left rotate-90"></div>
      <div className="absolute left-0 top-0 right-0 h-[200px] room-wall transform origin-top"></div>

      {/* Furniture items */}
      {items.map((item) => (
        <motion.div
          key={item.id}
          className={`furniture-item absolute ${activeItem === item.id ? "active" : ""}`}
          style={{
            left: 0,
            top: 0,
            width: item.width,
            height: item.height,
            backgroundColor: item.color,
            borderRadius: "4px",
            zIndex: item.zIndex,
          }}
          initial={{ x: item.x, y: item.y, rotate: item.rotation }}
          animate={{
            x: item.x,
            y: item.y,
            rotate: item.rotation,
            scale: activeItem === item.id ? 1.05 : 1,
          }}
          drag
          dragMomentum={false}
          onDragEnd={(_, info) => {
            const newX = item.x + info.offset.x
            const newY = item.y + info.offset.y
            handleDragEnd(item.id, newX, newY)
          }}
          onClick={(e) => handleItemClick(item.id, e)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{item.type}</div>
        </motion.div>
      ))}

      {/* Furniture controls */}
      {showControls && (
        <motion.div
          className="furniture-controls"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            left: controlsPosition.x,
            top: controlsPosition.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="control-button" onClick={() => handleRotate(showControls)} title="Rotate">
            <RotateCw size={16} />
          </div>
          <div className="control-button" onClick={() => handleResize(showControls, true)} title="Increase size">
            <Maximize size={16} />
          </div>
          <div className="control-button" onClick={() => handleResize(showControls, false)} title="Decrease size">
            <Minimize size={16} />
          </div>
          <div
            className="control-button"
            onClick={() => {
              setActiveItem(null)
              setShowControls(null)
            }}
            title="Close"
          >
            <X size={16} />
          </div>
        </motion.div>
      )}

      {/* Helper text */}
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600">
        Click and drag items to rearrange • Click an item to edit
      </div>
    </div>
  )
}
