"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { RotateCw, Maximize, Minimize, Palette, Trash2, Copy } from "lucide-react"

type FurnitureItem = {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  depth?: number
  color: string
  rotation: number
  zIndex: number
  name: string
  texture?: string
}

const furnitureItems: FurnitureItem[] = [
  {
    id: "sofa1",
    type: "sofa",
    x: 250,
    y: 300,
    width: 200,
    height: 100,
    depth: 40,
    color: "var(--sofa-color)",
    rotation: 0,
    zIndex: 5,
    name: "Modern Sofa",
    texture: "linear-gradient(to bottom, var(--sofa-color), hsl(from var(--sofa-color) h s l / 0.8))",
  },
  {
    id: "table1",
    type: "table",
    x: 400,
    y: 450,
    width: 120,
    height: 80,
    depth: 30,
    color: "var(--table-color)",
    rotation: 0,
    zIndex: 4,
    name: "Coffee Table",
    texture: "linear-gradient(45deg, var(--table-color), hsl(from var(--table-color) h s l / 0.9))",
  },
  {
    id: "chair1",
    type: "chair",
    x: 550,
    y: 350,
    width: 60,
    height: 60,
    depth: 20,
    color: "var(--chair-color)",
    rotation: 45,
    zIndex: 3,
    name: "Accent Chair",
    texture: "linear-gradient(to right, var(--chair-color), hsl(from var(--chair-color) h s l / 0.85))",
  },
  {
    id: "chair2",
    type: "chair",
    x: 600,
    y: 450,
    width: 60,
    height: 60,
    depth: 20,
    color: "var(--chair-color)",
    rotation: -45,
    zIndex: 3,
    name: "Accent Chair",
    texture: "linear-gradient(to right, var(--chair-color), hsl(from var(--chair-color) h s l / 0.85))",
  },
  {
    id: "lamp1",
    type: "lamp",
    x: 200,
    y: 200,
    width: 40,
    height: 40,
    depth: 80,
    color: "var(--lamp-color)",
    rotation: 0,
    zIndex: 2,
    name: "Floor Lamp",
    texture: "radial-gradient(circle, hsl(from var(--lamp-color) h s calc(l + 10%)), var(--lamp-color))",
  },
  {
    id: "plant1",
    type: "plant",
    x: 650,
    y: 200,
    width: 50,
    height: 50,
    depth: 60,
    color: "var(--plant-color)",
    rotation: 0,
    zIndex: 2,
    name: "Potted Plant",
    texture: "linear-gradient(to bottom, hsl(from var(--plant-color) h s calc(l + 5%)), var(--plant-color))",
  },
  {
    id: "cabinet1",
    type: "cabinet",
    x: 800,
    y: 300,
    width: 150,
    height: 60,
    depth: 35,
    color: "var(--cabinet-color)",
    rotation: 0,
    zIndex: 1,
    name: "TV Cabinet",
    texture:
      "linear-gradient(90deg, hsl(from var(--cabinet-color) h s calc(l - 5%)), var(--cabinet-color), hsl(from var(--cabinet-color) h s calc(l - 5%)))",
  },
  {
    id: "rug1",
    type: "rug",
    x: 400,
    y: 400,
    width: 300,
    height: 200,
    depth: 5,
    color: "var(--rug-color)",
    rotation: 0,
    zIndex: 0,
    name: "Area Rug",
    texture:
      "repeating-linear-gradient(45deg, var(--rug-color), hsl(from var(--rug-color) h s calc(l + 5%)) 10px, var(--rug-color) 20px)",
  },
]

const colorPalettes = {
  modern: {
    sofa: "#0c4a6e",
    table: "#0f766e",
    chair: "#65a30d",
    lamp: "#f59e0b",
    plant: "#15803d",
    cabinet: "#7c3aed",
    rug: "#be123c",
  },
  minimal: {
    sofa: "#94a3b8",
    table: "#64748b",
    chair: "#94a3b8",
    lamp: "#cbd5e1",
    plant: "#84cc16",
    cabinet: "#64748b",
    rug: "#cbd5e1",
  },
  cozy: {
    sofa: "#b45309",
    table: "#92400e",
    chair: "#a16207",
    lamp: "#d97706",
    plant: "#4d7c0f",
    cabinet: "#7e22ce",
    rug: "#9f1239",
  },
}

export default function FullWidthIsometricRoom() {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [showControls, setShowControls] = useState<string | null>(null)
  const [controlsPosition, setControlsPosition] = useState({ x: 0, y: 0 })
  const [items, setItems] = useState<FurnitureItem[]>(furnitureItems)
  const [isDragging, setIsDragging] = useState(false)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [snapAnimation, setSnapAnimation] = useState<string | null>(null)
  const [colorPalette, setColorPalette] = useState<"modern" | "minimal" | "cozy">("modern")
  const [showGlow, setShowGlow] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Track drag offset for precise positioning
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const currentItemRef = useRef<string | null>(null)

  // Initialize component
  useEffect(() => {
    // Ensure the component is fully initialized
    setIsInitialized(true)

    // Apply initial color palette
    updateItemsWithColorPalette(colorPalette)

    // Add a subtle animation to items when they first appear
    const timer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.classList.add("fade-in-complete")
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Apply color palette to items
  useEffect(() => {
    if (isInitialized) {
      updateItemsWithColorPalette(colorPalette)
    }
  }, [colorPalette, isInitialized])

  const updateItemsWithColorPalette = (palette: "modern" | "minimal" | "cozy") => {
    const newItems = items.map((item) => {
      const paletteColors = colorPalettes[palette]
      const typeKey = item.type as keyof typeof paletteColors
      const newColor = paletteColors[typeKey] || item.color

      // Update texture based on new color
      let newTexture = ""
      switch (item.type) {
        case "sofa":
          newTexture = `linear-gradient(to bottom, ${newColor}, ${adjustColorBrightness(newColor, -20)})`
          break
        case "table":
          newTexture = `linear-gradient(45deg, ${newColor}, ${adjustColorBrightness(newColor, -10)})`
          break
        case "chair":
          newTexture = `linear-gradient(to right, ${newColor}, ${adjustColorBrightness(newColor, -15)})`
          break
        case "lamp":
          newTexture = `radial-gradient(circle, ${adjustColorBrightness(newColor, 20)}, ${newColor})`
          break
        case "plant":
          newTexture = `linear-gradient(to bottom, ${adjustColorBrightness(newColor, 10)}, ${newColor})`
          break
        case "cabinet":
          newTexture = `linear-gradient(90deg, ${adjustColorBrightness(newColor, -10)}, ${newColor}, ${adjustColorBrightness(newColor, -10)})`
          break
        case "rug":
          newTexture = `repeating-linear-gradient(45deg, ${newColor}, ${adjustColorBrightness(newColor, 10)} 10px, ${newColor} 20px)`
          break
        default:
          newTexture = newColor
      }

      return {
        ...item,
        color: newColor,
        texture: newTexture,
      }
    })
    setItems(newItems)
  }

  // Helper function to adjust color brightness
  const adjustColorBrightness = (hex: string, percent: number) => {
    // Convert hex to RGB
    let r = Number.parseInt(hex.substring(1, 3), 16)
    let g = Number.parseInt(hex.substring(3, 5), 16)
    let b = Number.parseInt(hex.substring(5, 7), 16)

    // Adjust brightness
    r = Math.min(255, Math.max(0, r + percent))
    g = Math.min(255, Math.max(0, g + percent))
    b = Math.min(255, Math.max(0, b + percent))

    // Convert back to hex
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
  }

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

  // Direct DOM manipulation for dragging
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (showControls) return

    const itemElement = itemRefs.current[id]
    if (!itemElement || !containerRef.current) return

    // Calculate the offset between mouse position and item top-left corner
    const itemRect = itemElement.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()

    dragOffsetRef.current = {
      x: e.clientX - itemRect.left,
      y: e.clientY - itemRect.top,
    }

    setActiveItem(id)
    currentItemRef.current = id
    setIsDragging(true)

    // Bring item to front by setting high z-index directly
    itemElement.style.zIndex = "100"
    itemElement.style.cursor = "grabbing"
    itemElement.classList.add("dragging")

    // Add global event listeners
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !currentItemRef.current || !containerRef.current) return

    const itemElement = itemRefs.current[currentItemRef.current]
    if (!itemElement) return

    // Get container position
    const containerRect = containerRef.current.getBoundingClientRect()

    // Calculate new position relative to container, accounting for the initial click offset
    const newX = e.clientX - containerRect.left - dragOffsetRef.current.x
    const newY = e.clientY - containerRect.top - dragOffsetRef.current.y

    // Update position directly in the DOM for immediate response
    itemElement.style.transform = `translate(${newX}px, ${newY}px) rotate(${items.find((item) => item.id === currentItemRef.current)?.rotation || 0}deg)`
  }

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging || !currentItemRef.current || !containerRef.current) return

    const itemElement = itemRefs.current[currentItemRef.current]
    if (!itemElement) return

    // Get container position
    const containerRect = containerRef.current.getBoundingClientRect()

    // Calculate final position
    const newX = e.clientX - containerRect.left - dragOffsetRef.current.x
    const newY = e.clientY - containerRect.top - dragOffsetRef.current.y

    // Create ripple effect
    createRipple(newX, newY)

    // Update state to save the new position
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === currentItemRef.current ? { ...item, x: newX, y: newY } : item)),
    )

    // Reset styles
    itemElement.classList.remove("dragging")
    itemElement.style.cursor = "grab"

    // Apply snap animation
    setSnapAnimation(currentItemRef.current)
    setTimeout(() => {
      setSnapAnimation(null)
    }, 300)

    // Clean up
    setIsDragging(false)
    currentItemRef.current = null

    // Remove global event listeners
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }

  // Touch event handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    e.stopPropagation()

    if (showControls) return

    const itemElement = itemRefs.current[id]
    if (!itemElement || !containerRef.current) return

    const touch = e.touches[0]
    const itemRect = itemElement.getBoundingClientRect()

    // Calculate the offset between touch position and item top-left corner
    dragOffsetRef.current = {
      x: touch.clientX - itemRect.left,
      y: touch.clientY - itemRect.top,
    }

    setActiveItem(id)
    currentItemRef.current = id
    setIsDragging(true)

    // Bring item to front by setting high z-index directly
    itemElement.style.zIndex = "100"
    itemElement.classList.add("dragging")
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isDragging || !currentItemRef.current || !containerRef.current) return

    const itemElement = itemRefs.current[currentItemRef.current]
    if (!itemElement) return

    const touch = e.touches[0]
    const containerRect = containerRef.current.getBoundingClientRect()

    // Calculate new position relative to container, accounting for the initial touch offset
    const newX = touch.clientX - containerRect.left - dragOffsetRef.current.x
    const newY = touch.clientY - containerRect.top - dragOffsetRef.current.y

    // Update position directly in the DOM for immediate response
    itemElement.style.transform = `translate(${newX}px, ${newY}px) rotate(${items.find((item) => item.id === currentItemRef.current)?.rotation || 0}deg)`
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || !currentItemRef.current || !containerRef.current) return

    const itemElement = itemRefs.current[currentItemRef.current]
    if (!itemElement) return

    // Get the current transform to extract position
    const transform = itemElement.style.transform
    const match = transform.match(/translate$$([^,]+)px,\s*([^)]+)px$$/)

    if (match) {
      const newX = Number.parseFloat(match[1])
      const newY = Number.parseFloat(match[2])

      // Create ripple effect
      createRipple(newX, newY)

      // Update state to save the new position
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === currentItemRef.current ? { ...item, x: newX, y: newY } : item)),
      )
    }

    // Reset styles
    itemElement.classList.remove("dragging")

    // Apply snap animation
    setSnapAnimation(currentItemRef.current)
    setTimeout(() => {
      setSnapAnimation(null)
    }, 300)

    // Clean up
    setIsDragging(false)
    currentItemRef.current = null
  }

  const handleItemClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (isDragging) return

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
      prevItems.map((item) =>
        item.id === id ? { ...item, zIndex: 10 } : { ...item, zIndex: item.type === "rug" ? 0 : 1 },
      ),
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
            depth: item.depth ? Math.max(5, item.depth * scale) : undefined,
          }
        }
        return item
      }),
    )
  }

  const handleChangeColor = (id: string) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          // Generate a random color
          const hue = Math.floor(Math.random() * 360)
          const newColor = `hsl(${hue}, 70%, 50%)`

          // Update texture based on new color
          let newTexture = ""
          switch (item.type) {
            case "sofa":
              newTexture = `linear-gradient(to bottom, ${newColor}, hsl(${hue}, 70%, 40%))`
              break
            case "table":
              newTexture = `linear-gradient(45deg, ${newColor}, hsl(${hue}, 70%, 45%))`
              break
            case "chair":
              newTexture = `linear-gradient(to right, ${newColor}, hsl(${hue}, 70%, 45%))`
              break
            case "lamp":
              newTexture = `radial-gradient(circle, hsl(${hue}, 70%, 60%), ${newColor})`
              break
            case "plant":
              newTexture = `linear-gradient(to bottom, hsl(${hue}, 70%, 55%), ${newColor})`
              break
            case "cabinet":
              newTexture = `linear-gradient(90deg, hsl(${hue}, 70%, 45%), ${newColor}, hsl(${hue}, 70%, 45%))`
              break
            case "rug":
              newTexture = `repeating-linear-gradient(45deg, ${newColor}, hsl(${hue}, 70%, 55%) 10px, ${newColor} 20px)`
              break
            default:
              newTexture = newColor
          }

          return {
            ...item,
            color: newColor,
            texture: newTexture,
          }
        }
        return item
      }),
    )
  }

  const handleDuplicate = (id: string) => {
    const itemToDuplicate = items.find((item) => item.id === id)
    if (itemToDuplicate) {
      const newItem = {
        ...itemToDuplicate,
        id: `${itemToDuplicate.type}${Date.now()}`,
        x: itemToDuplicate.x + 50,
        y: itemToDuplicate.y + 50,
      }
      setItems([...items, newItem])
      setActiveItem(newItem.id)
      setShowControls(newItem.id)

      // Position controls near the new item
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setControlsPosition({
          x: newItem.x - rect.left,
          y: newItem.y - rect.top - 50,
        })
      }
    }
  }

  const handleDelete = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    setActiveItem(null)
    setShowControls(null)
  }

  const handleContainerClick = () => {
    setActiveItem(null)
    setShowControls(null)
  }

  const handleMouseOver = (id: string, e: React.MouseEvent) => {
    if (isDragging || showControls) return

    const item = items.find((i) => i.id === id)
    if (item) {
      setShowTooltip(id)
      setShowGlow(id)
      setTooltipPosition({
        x: e.clientX,
        y: e.clientY - 40,
      })
    }
  }

  const handleMouseOut = () => {
    setShowTooltip(null)
    setShowGlow(null)
  }

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-white rounded-xl overflow-hidden furniture-palette fade-in"
      onClick={handleContainerClick}
      style={{
        opacity: 0,
        animation: "fadeIn 0.8s forwards",
      }}
    >
      {/* Room floor with realistic texture */}
      <div
        className="absolute inset-0 room-floor bg-gray-50"
        style={{
          backgroundImage: `
          linear-gradient(90deg, rgba(229,231,235,0.5) 1px, transparent 1px),
          linear-gradient(0deg, rgba(229,231,235,0.5) 1px, transparent 1px),
          linear-gradient(rgba(255,255,255,0.8), rgba(240,240,240,0.8))
        `,
          backgroundSize: "20px 20px, 20px 20px, 100% 100%",
        }}
      ></div>

      {/* Room walls with realistic texture and lighting */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[40%] hero-wall bg-gray-100 shadow-3d"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(240,240,240,0.7))",
          boxShadow: "inset 0 0 30px rgba(0,0,0,0.05)",
        }}
      ></div>
      <div
        className="absolute left-0 top-0 right-0 h-[40%] hero-wall-side bg-gray-200 shadow-3d"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.9), rgba(240,240,240,0.7))",
          boxShadow: "inset 0 0 30px rgba(0,0,0,0.05)",
        }}
      ></div>

      {/* Ambient lighting effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), transparent 70%)",
        }}
      ></div>

      {/* Furniture items */}
      <div className="hero-isometric absolute inset-0">
        {items.map((item, index) => (
          <div
            key={item.id}
            ref={(el) => (itemRefs.current[item.id] = el)}
            className={`furniture-item absolute ${activeItem === item.id ? "active" : ""} ${snapAnimation === item.id ? "snap-animation" : ""} ${showGlow === item.id ? "glow-effect" : ""}`}
            style={{
              width: item.width,
              height: item.height,
              background: item.texture || item.color,
              borderRadius: item.type === "rug" ? "4px" : "4px",
              zIndex: item.zIndex,
              boxShadow: showGlow === item.id ? `0 0 15px ${item.color}80` : "0 4px 8px rgba(0,0,0,0.15)",
              cursor: isDragging && activeItem === item.id ? "grabbing" : "grab",
              userSelect: "none",
              touchAction: "none",
              transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg)`,
              transformOrigin: "center center",
              willChange: "transform",
              transition:
                isDragging && activeItem === item.id ? "none" : "transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
              border: "1px solid rgba(0,0,0,0.1)",
              animation: `fadeIn 0.5s forwards ${0.1 + index * 0.05}s`,
              opacity: 0,
            }}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
            onTouchStart={(e) => handleTouchStart(e, item.id)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => handleItemClick(item.id, e)}
            onMouseOver={(e) => handleMouseOver(item.id, e)}
            onMouseOut={handleMouseOut}
          >
            <div
              className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
            >
              {item.type}
            </div>

            {/* 3D effect for furniture with enhanced shadows */}
            {item.depth && item.depth > 0 && item.type !== "rug" && (
              <>
                <div
                  className="absolute left-0 right-0 bottom-0 bg-black/20"
                  style={{
                    height: `${item.depth}px`,
                    transform: "rotateX(90deg)",
                    transformOrigin: "bottom",
                    background: `linear-gradient(to bottom, ${item.color}90, ${item.color}40)`,
                  }}
                ></div>

                {/* Side face for 3D effect */}
                <div
                  className="absolute top-0 bottom-0 right-0 bg-black/10"
                  style={{
                    width: `${item.depth}px`,
                    transform: "rotateY(90deg)",
                    transformOrigin: "right",
                    background: `linear-gradient(to right, ${item.color}90, ${item.color}40)`,
                  }}
                ></div>
              </>
            )}

            {/* Shadow beneath item */}
            <div
              className="absolute"
              style={{
                width: `${item.width * 0.9}px`,
                height: `${item.height * 0.9}px`,
                borderRadius: "50%",
                background: "radial-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0) 70%)",
                transform: "translateY(5px) rotateX(-90deg)",
                transformOrigin: "center bottom",
                zIndex: -1,
                opacity: 0.7,
              }}
            ></div>
          </div>
        ))}
      </div>

      {/* Enhanced furniture controls with better styling */}
      {showControls && (
        <div
          className="furniture-controls"
          style={{
            left: controlsPosition.x,
            top: controlsPosition.y,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
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
          <div className="control-button" onClick={() => handleChangeColor(showControls)} title="Change color">
            <Palette size={16} />
          </div>
          <div className="control-button" onClick={() => handleDuplicate(showControls)} title="Duplicate">
            <Copy size={16} />
          </div>
          <div className="control-button" onClick={() => handleDelete(showControls)} title="Delete">
            <Trash2 size={16} />
          </div>
        </div>
      )}

      {/* Enhanced item tooltip with better styling */}
      {showTooltip && (
        <div
          className="fixed bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-xs z-50 pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: "translate(-50%, -100%)",
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          <div className="font-semibold">{items.find((item) => item.id === showTooltip)?.name}</div>
          <div className="text-gray-500 text-[10px]">Click to edit • Drag to move</div>
        </div>
      )}

      {/* Style switcher with better styling */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 flex gap-2 shadow-md border border-gray-100">
        <button
          className={`px-2 py-1 text-xs rounded transition-all duration-300 ${colorPalette === "modern" ? "bg-dreamspace-navy text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          onClick={() => setColorPalette("modern")}
        >
          Modern
        </button>
        <button
          className={`px-2 py-1 text-xs rounded transition-all duration-300 ${colorPalette === "minimal" ? "bg-dreamspace-navy text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          onClick={() => setColorPalette("minimal")}
        >
          Minimal
        </button>
        <button
          className={`px-2 py-1 text-xs rounded transition-all duration-300 ${colorPalette === "cozy" ? "bg-dreamspace-navy text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          onClick={() => setColorPalette("cozy")}
        >
          Cozy
        </button>
      </div>

      {/* Helper text with better styling */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 shadow-md border border-gray-100">
        <div className="font-medium">Interactive Room</div>
        <div>Click and drag items to rearrange • Click an item to edit</div>
      </div>
    </div>
  )
}
