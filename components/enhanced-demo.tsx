"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { Wand2, Undo, Redo, Save, Download, RotateCw, Maximize, Minimize } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

const roomStyles = {
  modern: {
    floor: "bg-gray-100",
    wall: "bg-white",
    items: [
      { id: "sofa1", type: "sofa", x: 50, y: 150, width: 180, height: 80, color: "#3b82f6", rotation: 0, zIndex: 1 },
      { id: "table1", type: "table", x: 150, y: 250, width: 100, height: 60, color: "#6b7280", rotation: 0, zIndex: 1 },
      { id: "chair1", type: "chair", x: 300, y: 200, width: 50, height: 50, color: "#6b7280", rotation: 0, zIndex: 1 },
      { id: "lamp1", type: "lamp", x: 50, y: 50, width: 30, height: 30, color: "#f59e0b", rotation: 0, zIndex: 1 },
    ],
  },
  minimal: {
    floor: "bg-gray-50",
    wall: "bg-gray-100",
    items: [
      { id: "sofa2", type: "sofa", x: 70, y: 170, width: 160, height: 70, color: "#d1d5db", rotation: 0, zIndex: 1 },
      { id: "table2", type: "table", x: 170, y: 270, width: 80, height: 50, color: "#9ca3af", rotation: 0, zIndex: 1 },
      { id: "chair2", type: "chair", x: 320, y: 220, width: 40, height: 40, color: "#9ca3af", rotation: 0, zIndex: 1 },
      { id: "plant1", type: "plant", x: 40, y: 40, width: 40, height: 40, color: "#84cc16", rotation: 0, zIndex: 1 },
    ],
  },
  cozy: {
    floor: "bg-dreamspace-sand/30",
    wall: "bg-dreamspace-sand/60",
    items: [
      { id: "sofa3", type: "sofa", x: 60, y: 160, width: 200, height: 90, color: "#b45309", rotation: 0, zIndex: 1 },
      { id: "table3", type: "table", x: 160, y: 260, width: 120, height: 70, color: "#92400e", rotation: 0, zIndex: 1 },
      { id: "chair3", type: "chair", x: 310, y: 210, width: 60, height: 60, color: "#92400e", rotation: 0, zIndex: 1 },
      { id: "lamp2", type: "lamp", x: 60, y: 60, width: 40, height: 40, color: "#f59e0b", rotation: 0, zIndex: 1 },
      { id: "plant2", type: "plant", x: 350, y: 60, width: 50, height: 50, color: "#65a30d", rotation: 0, zIndex: 1 },
    ],
  },
}

export default function EnhancedDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState<"modern" | "minimal" | "cozy">("modern")
  const [isLoading, setIsLoading] = useState(false)
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [showControls, setShowControls] = useState<string | null>(null)
  const [controlsPosition, setControlsPosition] = useState({ x: 0, y: 0 })
  const [items, setItems] = useState<FurnitureItem[]>(roomStyles.modern.items)
  const [history, setHistory] = useState<FurnitureItem[][]>([roomStyles.modern.items])
  const [historyIndex, setHistoryIndex] = useState(0)

  useEffect(() => {
    setItems(roomStyles[style].items)
    setHistory([roomStyles[style].items])
    setHistoryIndex(0)
  }, [style])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt) return

    setIsLoading(true)

    // Simulate AI processing
    setTimeout(() => {
      if (prompt.toLowerCase().includes("modern")) {
        setStyle("modern")
      } else if (prompt.toLowerCase().includes("minimal")) {
        setStyle("minimal")
      } else if (prompt.toLowerCase().includes("cozy")) {
        setStyle("cozy")
      } else {
        // If no specific style mentioned, just change some furniture colors
        const newItems = items.map((item) => ({
          ...item,
          color: getRandomColor(),
        }))
        setItems(newItems)
        addToHistory(newItems)
      }

      setIsLoading(false)
      setPrompt("")
    }, 1500)
  }

  const getRandomColor = () => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
    return colors[Math.floor(Math.random() * colors.length)]
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

  const handleDragEnd = (id: string, x: number, y: number) => {
    createRipple(x, y)

    const newItems = items.map((item) => (item.id === id ? { ...item, x, y } : item))

    setItems(newItems)
    addToHistory(newItems)
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
    const newItems = items.map((item) => (item.id === id ? { ...item, zIndex: 10 } : { ...item, zIndex: 1 }))

    setItems(newItems)
  }

  const handleRotate = (id: string) => {
    const newItems = items.map((item) => (item.id === id ? { ...item, rotation: (item.rotation + 45) % 360 } : item))

    setItems(newItems)
    addToHistory(newItems)
  }

  const handleResize = (id: string, increase: boolean) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        const scale = increase ? 1.1 : 0.9
        return {
          ...item,
          width: Math.max(20, item.width * scale),
          height: Math.max(20, item.height * scale),
        }
      }
      return item
    })

    setItems(newItems)
    addToHistory(newItems)
  }

  const handleContainerClick = () => {
    setActiveItem(null)
    setShowControls(null)
  }

  const addToHistory = (newItems: FurnitureItem[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newItems)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setItems(history[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setItems(history[historyIndex + 1])
    }
  }

  return (
    <section id="demo" className="py-16 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-dreamspace-charcoal mb-4">Try It Yourself</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience the power of AI-driven design. Drag furniture items or use the prompt to transform the space.
          </p>
          <div className="mt-4 inline-block bg-dreamspace-navy/10 rounded-full px-4 py-2 text-dreamspace-navy font-medium text-sm">
            Try It Out: Customize Your Dream Space Below!
          </div>
        </div>

        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <Tabs defaultValue="room" className="w-full">
            <div className="px-4 py-3 border-b">
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="room">Room Designer</TabsTrigger>
                  <TabsTrigger value="styles">Style Gallery</TabsTrigger>
                </TabsList>

                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={handleUndo} disabled={historyIndex === 0} title="Undo">
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRedo}
                    disabled={historyIndex === history.length - 1}
                    title="Redo"
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <TabsContent value="room" className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-5">
                <div className="lg:col-span-3 p-4">
                  <div
                    ref={containerRef}
                    className="relative h-[400px] bg-gray-50 rounded-lg overflow-hidden"
                    onClick={handleContainerClick}
                  >
                    {/* Room floor */}
                    <div className={`absolute inset-0 room-floor ${roomStyles[style].floor}`}></div>

                    {/* Room walls */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-[200px] room-wall ${roomStyles[style].wall} transform origin-left rotate-90`}
                    ></div>
                    <div
                      className={`absolute left-0 top-0 right-0 h-[200px] room-wall ${roomStyles[style].wall} transform origin-top`}
                    ></div>

                    {/* Furniture items */}
                    <AnimatePresence>
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
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: 1,
                            scale: activeItem === item.id ? 1.05 : 1,
                            x: item.x,
                            y: item.y,
                            rotate: item.rotation,
                          }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          drag
                          dragMomentum={false}
                          onDragEnd={(_, info) => {
                            const newX = item.x + info.offset.x
                            const newY = item.y + info.offset.y
                            handleDragEnd(item.id, newX, newY)
                          }}
                          onClick={(e) => handleItemClick(item.id, e)}
                          whileHover={{ scale: activeItem === item.id ? 1.05 : 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                            {item.type}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Furniture controls */}
                    {showControls && (
                      <motion.div
                        className="furniture-controls"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                          left: controlsPosition.x,
                          top: controlsPosition.y,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="control-button" onClick={() => handleRotate(showControls)} title="Rotate">
                          <RotateCw size={16} />
                        </div>
                        <div
                          className="control-button"
                          onClick={() => handleResize(showControls, true)}
                          title="Increase size"
                        >
                          <Maximize size={16} />
                        </div>
                        <div
                          className="control-button"
                          onClick={() => handleResize(showControls, false)}
                          title="Decrease size"
                        >
                          <Minimize size={16} />
                        </div>
                      </motion.div>
                    )}

                    {/* Loading overlay */}
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dreamspace-navy"></div>
                          <p className="mt-4 text-dreamspace-navy font-medium">Generating your design...</p>
                        </div>
                      </div>
                    )}

                    {/* Helper text */}
                    <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600">
                      Click and drag items to rearrange • Click an item to edit
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
                    <Input
                      type="text"
                      placeholder="Try: 'Show me a cozy living room'"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading} className="bg-dreamspace-navy">
                      {isLoading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-2" />
                      )}
                      {isLoading ? "" : "Generate"}
                    </Button>
                  </form>
                </div>

                <div className="lg:col-span-2 p-4 bg-gray-50 border-l">
                  <h3 className="text-xl font-semibold mb-4">
                    Current Style: {style.charAt(0).toUpperCase() + style.slice(1)}
                  </h3>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Try dragging the furniture items in the room to rearrange them. You can also use the prompt box to
                      change the style of the room or ask for specific changes.
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStyle("modern")}
                        className={style === "modern" ? "border-dreamspace-navy text-dreamspace-navy" : ""}
                      >
                        Modern
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStyle("minimal")}
                        className={style === "minimal" ? "border-dreamspace-navy text-dreamspace-navy" : ""}
                      >
                        Minimal
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStyle("cozy")}
                        className={style === "cozy" ? "border-dreamspace-navy text-dreamspace-navy" : ""}
                      >
                        Cozy
                      </Button>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Try these prompts:</h4>
                      <ul className="space-y-2 text-sm">
                        <li
                          className="p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setPrompt("Show me a modern living room")}
                        >
                          "Show me a modern living room"
                        </li>
                        <li
                          className="p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setPrompt("Create a cozy reading nook")}
                        >
                          "Create a cozy reading nook"
                        </li>
                        <li
                          className="p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setPrompt("Design a minimal workspace")}
                        >
                          "Design a minimal workspace"
                        </li>
                      </ul>
                    </div>

                    <div className="flex justify-between mt-6">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Save className="h-4 w-4" />
                        Save Design
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="styles" className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {["modern", "minimal", "cozy"].map((styleOption) => (
                  <div
                    key={styleOption}
                    className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      style === styleOption ? "border-dreamspace-navy" : "border-transparent hover:border-gray-200"
                    }`}
                    onClick={() => setStyle(styleOption as "modern" | "minimal" | "cozy")}
                  >
                    <div className={`h-48 ${roomStyles[styleOption as "modern" | "minimal" | "cozy"].floor}`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-lg font-medium capitalize">{styleOption}</div>
                      </div>
                      {style === styleOption && (
                        <div className="absolute top-2 right-2 bg-dreamspace-navy text-white text-xs px-2 py-1 rounded-full">
                          Active
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
