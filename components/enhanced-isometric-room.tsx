"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import * as THREE from "three"
import { debounce, throttle } from "lodash"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

// Type definitions
interface FurnitureItem {
  id: string
  type: string
  position: [number, number, number]
  rotation: [number, number, number]
  dimensions: [number, number, number]
  color?: string
  originalPosition?: [number, number, number]
  originalRotation?: [number, number, number]
}

interface TextureCache {
  [key: string]: THREE.Texture
}

interface EnhancedIsometricRoomProps {
  autoInitialize?: boolean
}

// Add custom animation delay style
const animationDelayStyle = `
  @keyframes delay-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .animation-delay-150 {
    animation-delay: 150ms;
  }
`

// Main component
export default function EnhancedIsometricRoom({ autoInitialize = false }: EnhancedIsometricRoomProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [instructions, setInstructions] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [selectedItemDetails, setSelectedItemDetails] = useState<any>(null)
  const [currentRotationAngle, setCurrentRotationAngle] = useState<number>(0)
  const [showRotationGuide, setShowRotationGuide] = useState(false)
  // Add these new state variables near the other state declarations:
  const [rotationStep, setRotationStep] = useState<number>(Math.PI / 6) // 30 degrees in radians
  const [lastKeyPressTime, setLastKeyPressTime] = useState<number>(0)
  const [showInstructions, setShowInstructions] = useState(false)
  const [initialized, setInitialized] = useState(autoInitialize)
  const [resetConfirmation, setResetConfirmation] = useState(false)

  // Initialize the room automatically if autoInitialize is true
  useEffect(() => {
    if (autoInitialize) {
      setInitialized(true)
    }
  }, [autoInitialize])

  const handleEnterClick = () => {
    setInitialized(true)
  }

  const toggleEditMode = () => {
    setEditMode(!editMode)
  }

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions)
  }

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  const planeRef = useRef<THREE.Mesh | null>(null)
  const outlineRef = useRef<THREE.Mesh | null>(null)
  const rotatorRef = useRef<THREE.Group | null>(null)
  const rotationMarkersRef = useRef<THREE.Group | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const furnitureRefs = useRef<{ [key: number]: THREE.Group }>({})
  const boundingBoxes = useRef<{ [key: number]: THREE.Box3 }>({})

  // Drag state
  const isDraggingRef = useRef(false)
  const isRotatingRef = useRef(false)
  const selectedObjectRef = useRef<THREE.Group | null>(null)
  const dragOffsetRef = useRef(new THREE.Vector3())
  const initialRotationRef = useRef(0)
  const initialMouseAngleRef = useRef(0)

  // Performance monitoring
  const fpsCounterRef = useRef<HTMLDivElement>(null)
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(Date.now())
  const showFpsRef = useRef(false)

  // Improved furniture layout with better positioning
  const [furniture, setFurniture] = useState([
    { id: 1, name: "Modern Sofa", color: "#5077a8", position: [0, 0.4, -1.5], size: [2.2, 0.8, 1], rotation: 0 },
    { id: 2, name: "Coffee Table", color: "#5c3c24", position: [0, 0.3, -2.8], size: [1.3, 0.5, 0.7], rotation: 0 },
    { id: 3, name: "Bookshelf", color: "#5c3c24", position: [-2.8, 1.2, -2.8], size: [1.5, 2.4, 0.4], rotation: 0 },
    { id: 4, name: "Armchair", color: "#7296c4", position: [2.0, 0.5, -2.0], size: [1, 1, 1], rotation: -0.7 },
    { id: 5, name: "Floor Lamp", color: "#E6B333", position: [2.5, 1.2, -1.0], size: [0.3, 2.4, 0.3], rotation: 0 },
    { id: 6, name: "TV Stand", color: "#3c2a1a", position: [0, 0.5, 2.2], size: [2.2, 0.8, 0.5], rotation: Math.PI },
    { id: 7, name: "Plant", color: "#20603D", position: [-2.3, 0.7, 1.8], size: [0.6, 1.4, 0.6], rotation: 0 },
    { id: 8, name: "Area Rug", color: "#8c8276", position: [0, 0.05, 0], size: [3.8, 0.1, 3], rotation: 0 },
    { id: 9, name: "Side Table", color: "#5c3c24", position: [-1.8, 0.4, -1.5], size: [0.7, 0.7, 0.7], rotation: 0 },
    {
      id: 10,
      name: "Abstract Art",
      color: "#d4a76a",
      position: [-3.38, 2, 0],
      size: [0.05, 1.2, 1.8],
      rotation: 0,
      wall: "left",
    },
    { id: 11, name: "Smart TV", color: "#1a1a1a", position: [0, 1.5, 2.2], size: [1.8, 1, 0.1], rotation: Math.PI },
  ])

  // Texture cache
  const textureCache = useRef<{ [key: string]: THREE.Texture }>({})

  // Create a cached texture or return from cache
  const createCachedTexture = useCallback((key: string, creator: () => THREE.Texture | null): THREE.Texture | null => {
    if (!textureCache.current[key]) {
      const texture = creator()
      if (texture) {
        textureCache.current[key] = texture
      } else {
        return null
      }
    }
    return textureCache.current[key]
  }, [])

  // Create a basic texture with a color
  const createBasicTexture = useCallback(
    (color: string) => {
      return createCachedTexture(`basic-${color}`, () => {
        const canvas = document.createElement("canvas")
        canvas.width = 256
        canvas.height = 256
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.fillStyle = color
          ctx.fillRect(0, 0, 256, 256)
          const texture = new THREE.CanvasTexture(canvas)
          if (texture) {
            texture.wrapS = THREE.RepeatWrapping
            texture.wrapT = THREE.RepeatWrapping
            return texture
          }
        }
        return null
      })
    },
    [createCachedTexture],
  )

  // Create a wood texture
  const createWoodTexture = useCallback(() => {
    return createCachedTexture("wood", () => {
      const canvas = document.createElement("canvas")
      canvas.width = 1024
      canvas.height = 1024
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Base color - warmer tone
        const gradient = ctx.createLinearGradient(0, 0, 1024, 1024)
        gradient.addColorStop(0, "#8B4513")
        gradient.addColorStop(0.3, "#A0522D")
        gradient.addColorStop(0.6, "#8B4513")
        gradient.addColorStop(1, "#6B3E26")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 1024, 1024)

        // Wood grain - more varied and natural
        for (let i = 0; i < 60; i++) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(62, 39, 35, ${0.2 + Math.random() * 0.3})`
          ctx.lineWidth = 2 + Math.random() * 3

          const y = i * 20 + Math.random() * 15
          ctx.moveTo(0, y)

          // Create more natural wavy lines for wood grain
          let prevX = 0
          let prevY = y
          for (let x = 50; x < 1024; x += 50) {
            const yOffset = Math.sin(x * 0.01) * 10 + Math.random() * 8 - 4
            const newY = y + yOffset

            // Use quadratic curves for smoother grain
            const cpX = (prevX + x) / 2
            const cpY = prevY + Math.random() * 10 - 5

            ctx.quadraticCurveTo(cpX, cpY, x, newY)

            prevX = x
            prevY = newY
          }
          ctx.stroke()
        }

        // Add subtle knots
        for (let i = 0; i < 5; i++) {
          const knotX = Math.random() * 1024
          const knotY = Math.random() * 1024
          const knotSize = 20 + Math.random() * 30

          const knotGradient = ctx.createRadialGradient(knotX, knotY, 0, knotX, knotY, knotSize)
          knotGradient.addColorStop(0, "#3E2723")
          knotGradient.addColorStop(0.7, "rgba(62, 39, 35, 0.5)")
          knotGradient.addColorStop(1, "rgba(62, 39, 35, 0)")

          ctx.fillStyle = knotGradient
          ctx.beginPath()
          ctx.arc(knotX, knotY, knotSize, 0, Math.PI * 2)
          ctx.fill()
        }

        const texture = new THREE.CanvasTexture(canvas)
        if (texture) {
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.RepeatWrapping
          return texture
        }
      }
      return null
    })
  }, [createCachedTexture])

  const createFabricTexture = useCallback(
    (color = "#E0E0E0") => {
      return createCachedTexture(`fabric-${color}`, () => {
        const canvas = document.createElement("canvas")
        canvas.width = 256
        canvas.height = 256
        const ctx = canvas.getContext("2d")
        if (ctx) {
          // Base color
          ctx.fillStyle = color
          ctx.fillRect(0, 0, 256, 256)

          // Fabric pattern
          ctx.fillStyle = "rgba(0,0,0,0.05)"
          for (let i = 0; i < 256; i += 4) {
            for (let j = 0; j < 256; j += 4) {
              if ((i + j) % 8 === 0) {
                ctx.fillRect(i, j, 2, 2)
              }
            }
          }

          const texture = new THREE.CanvasTexture(canvas)
          if (texture) {
            texture.wrapS = THREE.RepeatWrapping
            texture.wrapT = THREE.RepeatWrapping
            return texture
          }
        }
        return null
      })
    },
    [createCachedTexture],
  )

  // Darken a color by a percentage
  const darkenColor = useCallback((color: string, percent: number): string => {
    const num = Number.parseInt(color.replace("#", ""), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.max(0, (num >> 16) - amt)
    const G = Math.max(0, ((num >> 8) & 0x00ff) - amt)
    const B = Math.max(0, (num & 0x0000ff) - amt)
    return "#" + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1)
  }, [])

  const createMarbleTexture = useCallback(() => {
    return createCachedTexture("marble", () => {
      const canvas = document.createElement("canvas")
      canvas.width = 1024
      canvas.height = 1024
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Base color - subtle gradient
        const gradient = ctx.createLinearGradient(0, 0, 1024, 1024)
        gradient.addColorStop(0, "#F5F5F5")
        gradient.addColorStop(0.3, "#E8E8E8")
        gradient.addColorStop(0.6, "#F0F0F0")
        gradient.addColorStop(1, "#E5E5E5")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 1024, 1024)

        // Add subtle texture
        for (let i = 0; i < 1024; i += 4) {
          for (let j = 0; j < 1024; j += 4) {
            if (Math.random() > 0.5) {
              ctx.fillStyle = `rgba(245, 245, 245, ${Math.random() * 0.1})`
              ctx.fillRect(i, j, 4, 4)
            }
          }
        }

        // Marble veins - more natural and varied
        for (let i = 0; i < 30; i++) {
          ctx.beginPath()
          const startX = Math.random() * 1024
          const startY = Math.random() * 1024

          // Vary the vein color and opacity
          const veinOpacity = 0.05 + Math.random() * 0.15
          ctx.strokeStyle = `rgba(180, 180, 180, ${veinOpacity})`
          ctx.lineWidth = 0.5 + Math.random() * 2

          ctx.moveTo(startX, startY)

          // Create more natural veining with multiple connected curves
          let currentX = startX
          let currentY = startY

          for (let j = 0; j < 5 + Math.random() * 5; j++) {
            const length = 50 + Math.random() * 150
            const angle = Math.random() * Math.PI * 2

            const controlX1 = currentX + Math.cos(angle) * length * 0.3
            const controlY1 = currentY + Math.sin(angle) * length * 0.3
            const controlX2 = currentX + Math.cos(angle) * length * 0.6
            const controlY2 = currentY + Math.sin(angle) * length * 0.6
            const endX = currentX + Math.cos(angle) * length
            const endY = currentY + Math.sin(angle) * length

            ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, endX, endY)

            currentX = endX
            currentY = endY
          }

          ctx.stroke()
        }
      }
      const texture = new THREE.CanvasTexture(canvas)
      return texture
    })
  }, [createCachedTexture])

  const createTVContentTexture = useCallback(() => {
    return createCachedTexture("tv-content", () => {
      const canvas = document.createElement("canvas")
      canvas.width = 512
      canvas.height = 256
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Background
        ctx.fillStyle = "#000033"
        ctx.fillRect(0, 0, 512, 256)

        // Sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, 100)
        skyGradient.addColorStop(0, "#1a2980")
        skyGradient.addColorStop(1, "#26d0ce")
        ctx.fillStyle = skyGradient
        ctx.fillRect(0, 0, 512, 100)

        // Mountains
        ctx.fillStyle = "#2c3e50"
        ctx.beginPath()
        ctx.moveTo(0, 100)
        ctx.lineTo(100, 70)
        ctx.lineTo(200, 90)
        ctx.lineTo(300, 60)
        ctx.lineTo(400, 80)
        ctx.lineTo(512, 70)
        ctx.lineTo(512, 100)
        ctx.closePath()
        ctx.fill()

        // Sun
        ctx.fillStyle = "#f39c12"
        ctx.beginPath()
        ctx.arc(400, 40, 20, 0, Math.PI * 2)
        ctx.fill()

        // House
        ctx.fillStyle = "#e74c3c"
        ctx.fillRect(150, 120, 80, 60)

        // House roof
        ctx.fillStyle = "#7f8c8d"
        ctx.beginPath()
        ctx.moveTo(140, 120)
        ctx.lineTo(190, 90)
        ctx.lineTo(240, 120)
        ctx.closePath()
        ctx.fill()

        // House door
        ctx.fillStyle = "#2c3e50"
        ctx.fillRect(180, 150, 20, 30)

        // House windows
        ctx.fillStyle = "#3498db"
        ctx.fillRect(160, 130, 15, 15)
        ctx.fillRect(205, 130, 15, 15)

        // Add some animated-looking elements
        for (let i = 0; i < 5; i++) {
          const x = Math.random() * 512
          const y = 120 + Math.random() * 100
          const size = 5 + Math.random() * 15
          ctx.fillStyle = "#ffffff"
          ctx.globalAlpha = 0.3 + Math.random() * 0.4
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.globalAlpha = 1.0

        // Add text to make it look like a TV show
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 20px Arial"
        ctx.textAlign = "center"
        ctx.fillText("DREAMSPACE TV", 256, 220)

        ctx.fillStyle = "#cccccc"
        ctx.font = "12px Arial"
        ctx.fillText("Now Playing: Home Design Show", 256, 240)
      }

      const texture = new THREE.CanvasTexture(canvas)
      return texture
    })
  }, [createCachedTexture])

  const createSplatterPaintingTexture = useCallback(() => {
    return createCachedTexture("splatter-painting", () => {
      const canvas = document.createElement("canvas")
      canvas.width = 1024
      canvas.height = 1024
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // White background
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, 0, 1024, 1024)

        // Create a more sophisticated painting

        // Background wash
        const bgGradient = ctx.createLinearGradient(0, 0, 1024, 1024)
        bgGradient.addColorStop(0, "rgba(240, 240, 255, 0.5)")
        bgGradient.addColorStop(1, "rgba(255, 240, 240, 0.5)")
        ctx.fillStyle = bgGradient
        ctx.fillRect(0, 0, 1024, 1024)

        // Rich color palette
        const colors = [
          "#e74c3c", // Red
          "#3498db", // Blue
          "#f1c40f", // Yellow
          "#2ecc71", // Green
          "#9b59b6", // Purple
          "#e67e22", // Orange
          "#1abc9c", // Teal
          "#d35400", // Dark Orange
        ]

        // Large color fields
        for (let i = 0; i < 5; i++) {
          const x = Math.random() * 1024
          const y = Math.random() * 1024
          const radius = 100 + Math.random() * 200

          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
          ctx.globalAlpha = 0.3 + Math.random() * 0.4
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.globalAlpha = 1.0

        // Add splatters
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * 1024
          const y = Math.random() * 1024
          const radius = 5 + Math.random() * 60

          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fill()

          // Add drips
          if (Math.random() > 0.5) {
            const drips = 1 + Math.floor(Math.random() * 3)
            for (let j = 0; j < drips; j++) {
              const dripLength = 20 + Math.random() * 100
              const dripWidth = 2 + Math.random() * 15
              const angle = Math.PI / 2 + (Math.random() * 0.5 - 0.25) // Mostly downward

              ctx.beginPath()
              ctx.moveTo(x, y)
              ctx.lineTo(x + Math.cos(angle) * dripLength, y + Math.sin(angle) * dripLength)
              ctx.lineWidth = dripWidth
              ctx.stroke()
            }
          }
        }

        // Add brush strokes
        for (let i = 0; i < 20; i++) {
          const startX = Math.random() * 1024
          const startY = Math.random() * 1024
          const length = 50 + Math.random() * 200
          const angle = Math.random() * Math.PI * 2
          const width = 5 + Math.random() * 20

          ctx.strokeStyle = colors[Math.floor(Math.random() * colors.length)]
          ctx.lineWidth = width
          ctx.beginPath()

          // Create curved brush strokes
          ctx.moveTo(startX, startY)

          const cp1x = startX + Math.cos(angle) * length * 0.3 + (Math.random() * 40 - 20)
          const cp1y = startY + Math.sin(angle) * length * 0.3 + (Math.random() * 40 - 20)
          const cp2x = startX + Math.cos(angle) * length * 0.6 + (Math.random() * 40 - 20)
          const cp2y = startY + Math.sin(angle) * length * 0.6 + (Math.random() * 40 - 20)
          const endX = startX + Math.cos(angle) * length
          const endY = startY + Math.sin(angle) * length

          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY)
          ctx.stroke()
        }

        // Add fine details
        for (let i = 0; i < 100; i++) {
          const x = Math.random() * 1024
          const y = Math.random() * 1024
          const size = 1 + Math.random() * 3

          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
          ctx.fillRect(x, y, size, size)
        }

        // Add signature in bottom corner
        ctx.fillStyle = "#333"
        ctx.font = "italic 20px Arial"
        ctx.fillText("Artist", 950, 1000)
      }

      const texture = new THREE.CanvasTexture(canvas)
      return texture
    })
  }, [createCachedTexture])

  const createCarpetTexture = useCallback(
    (color = "#D2B48C") => {
      return createCachedTexture(`carpet-${color}`, () => {
        const canvas = document.createElement("canvas")
        canvas.width = 512
        canvas.height = 512
        const ctx = canvas.getContext("2d")
        if (ctx) {
          // Base color
          ctx.fillStyle = color
          ctx.fillRect(0, 0, 512, 512)

          // Carpet pattern
          ctx.fillStyle = "rgba(0,0,0,0.1)"

          // Create a grid pattern
          for (let i = 0; i < 512; i += 16) {
            for (let j = 0; j < 512; j += 16) {
              if ((i + j) % 32 === 0) {
                ctx.fillRect(i, j, 8, 8)
              }
            }
          }

          const texture = new THREE.CanvasTexture(canvas)
          if (texture) {
            texture.wrapS = THREE.RepeatWrapping
            texture.wrapT = THREE.RepeatWrapping
            texture.repeat.set(4, 4)
            return texture
          }
        }
        return null
      })
    },
    [createCachedTexture],
  )

  // Create a sofa with detailed cushions and pillows
  const createSofa = useCallback(
    (group: THREE.Group, size: number[], color: string) => {
      // Get textures with null checks
      const fabricTexture = createFabricTexture(darkenColor(color, 10))
      const mainFabricTexture = createFabricTexture(color)
      const woodTexture = createWoodTexture()

      // Base frame
      const frameGeometry = new THREE.BoxGeometry(size[0], size[1] * 0.5, size[2])
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: darkenColor(color, 10),
        roughness: 0.7,
        map: fabricTexture,
      })
      const frame = new THREE.Mesh(frameGeometry, frameMaterial)
      frame.position.y = -size[1] * 0.15
      frame.castShadow = true
      frame.receiveShadow = true
      group.add(frame)

      // Main seat cushion
      const seatGeometry = new THREE.BoxGeometry(size[0] * 0.9, size[1] * 0.3, size[2] * 0.8)
      const seatMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.9,
        map: mainFabricTexture,
      })
      const seat = new THREE.Mesh(seatGeometry, seatMaterial)
      seat.position.y = size[1] * 0.1
      seat.castShadow = true
      seat.receiveShadow = true
      group.add(seat)

      // Back cushion
      const backGeometry = new THREE.BoxGeometry(size[0] * 0.9, size[1] * 0.5, size[2] * 0.3)
      const backMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.9,
        map: mainFabricTexture,
      })
      const back = new THREE.Mesh(backGeometry, backMaterial)
      back.position.set(0, size[1] * 0.3, -size[2] * 0.35)
      back.castShadow = true
      back.receiveShadow = true
      group.add(back)

      // Arms
      const armGeometry = new THREE.BoxGeometry(size[0] * 0.15, size[1] * 0.6, size[2])
      const armMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.8,
        map: mainFabricTexture,
      })

      // Left arm
      const leftArm = new THREE.Mesh(armGeometry, armMaterial)
      leftArm.position.set(-size[0] * 0.425, size[1] * 0.05, 0)
      leftArm.castShadow = true
      leftArm.receiveShadow = true
      group.add(leftArm)

      // Left arm padding
      const leftPadGeometry = new THREE.BoxGeometry(size[0] * 0.18, size[1] * 0.15, size[2] * 0.8)
      const leftPad = new THREE.Mesh(
        leftPadGeometry,
        new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.9,
          map: mainFabricTexture,
        }),
      )
      leftPad.position.set(-size[0] * 0.425, size[1] * 0.35, 0)
      leftPad.castShadow = true
      leftPad.receiveShadow = true
      group.add(leftPad)

      // Right arm
      const rightArm = new THREE.Mesh(armGeometry, armMaterial)
      rightArm.position.set(size[0] * 0.425, size[1] * 0.05, 0)
      rightArm.castShadow = true
      rightArm.receiveShadow = true
      group.add(rightArm)

      // Right arm padding
      const rightPadGeometry = new THREE.BoxGeometry(size[0] * 0.18, size[1] * 0.15, size[2] * 0.8)
      const rightPad = new THREE.Mesh(
        rightPadGeometry,
        new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.9,
          map: mainFabricTexture,
        }),
      )
      rightPad.position.set(size[0] * 0.425, size[1] * 0.35, 0)
      rightPad.castShadow = true
      rightPad.receiveShadow = true
      group.add(rightPad)

      // Decorative throw pillows with fixed positions
      const pillowPositions = [
        [-size[0] * 0.3, size[1] * 0.4, -size[2] * 0.25],
        [size[0] * 0.3, size[1] * 0.4, -size[2] * 0.25],
      ]

      const pillowColors = ["#b77b59", "#b8cde5"] // Fixed colors

      pillowPositions.forEach((pos, idx) => {
        const pillowGeometry = new THREE.BoxGeometry(size[0] * 0.2, size[1] * 0.2, size[1] * 0.2, 8, 8, 8)
        const pillowMaterial = new THREE.MeshStandardMaterial({
          color: pillowColors[idx],
          roughness: 1.0,
          map: createFabricTexture(pillowColors[idx]),
        })

        const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial)
        pillow.position.set(...pos)

        // Use fixed rotation values instead of random
        pillow.rotation.set(idx * 0.1, idx * 0.2, idx * 0.1)

        pillow.castShadow = true
        pillow.receiveShadow = true
        group.add(pillow)

        // Store original color and position in userData
        pillow.userData.originalColor = pillowColors[idx]
        pillow.userData.originalPosition = [...pos]
      })

      // Legs
      const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, size[1] * 0.3, 8)
      const legMaterial = new THREE.MeshStandardMaterial({
        color: "#412917",
        roughness: 0.5,
        metalness: 0.3,
        map: woodTexture,
      })

      const legPositions = [
        [-size[0] / 2 + 0.1, -size[1] * 0.45, size[2] / 2 - 0.1],
        [size[0] / 2 - 0.1, -size[1] * 0.45, size[2] / 2 - 0.1],
        [-size[0] / 2 + 0.1, -size[1] * 0.45, -size[2] / 2 + 0.1],
        [size[0] / 2 - 0.1, -size[1] * 0.45, -size[2] / 2 + 0.1],
      ]

      legPositions.forEach((pos) => {
        const leg = new THREE.Mesh(legGeometry, legMaterial)
        leg.position.set(pos[0], pos[1], pos[2])
        leg.castShadow = true
        leg.receiveShadow = true
        group.add(leg)
      })
    },
    [createFabricTexture, createWoodTexture, darkenColor],
  )

  // Create an armchair
  const createArmchair = useCallback(
    (group: THREE.Group, size: number[], color: string) => {
      // Main seat
      const seatGeometry = new THREE.BoxGeometry(size[0], size[1] * 0.5, size[2])
      const mainMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.9,
        map: createFabricTexture(color),
      })
      const seat = new THREE.Mesh(seatGeometry, mainMaterial)
      seat.castShadow = true
      seat.receiveShadow = true
      group.add(seat)

      // Back
      const backGeometry = new THREE.BoxGeometry(size[0], size[1] * 0.9, size[2] * 0.25)
      const backCushion = new THREE.Mesh(backGeometry, mainMaterial)
      backCushion.position.set(0, size[1] * 0.2, -size[2] * 0.375)
      backCushion.castShadow = true
      backCushion.receiveShadow = true
      group.add(backCushion)

      // Arms
      const armGeometry = new THREE.BoxGeometry(size[0] * 0.15, size[1] * 0.6, size[2])
      const leftArm = new THREE.Mesh(armGeometry, mainMaterial)
      leftArm.position.set(-size[0] * 0.425, size[1] * 0.05, 0)
      leftArm.castShadow = true
      leftArm.receiveShadow = true
      group.add(leftArm)

      const rightArm = new THREE.Mesh(armGeometry, mainMaterial)
      rightArm.position.set(size[0] * 0.425, size[1] * 0.05, 0)
      rightArm.castShadow = true
      rightArm.receiveShadow = true
      group.add(rightArm)

      // Add a decorative pillow
      const pillowGeometry = new THREE.BoxGeometry(size[0] * 0.5, size[1] * 0.15, size[1] * 0.15, 8, 8, 8)
      const pillowMaterial = new THREE.MeshStandardMaterial({
        color: darkenColor(color, -20), // Lighter color for contrast
        roughness: 1.0,
        map: createFabricTexture(darkenColor(color, -20)),
      })

      const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial)
      pillow.position.set(0, size[1] * 0.3, size[2] * 0.3)
      pillow.rotation.set(0.2, 0, 0)
      pillow.castShadow = true
      pillow.receiveShadow = true
      group.add(pillow)

      // Legs
      const legGeometry = new THREE.CylinderGeometry(0.04, 0.04, size[1] * 0.4, 8)
      const legMaterial = new THREE.MeshStandardMaterial({
        color: "#412917",
        roughness: 0.5,
        map: createWoodTexture(),
      })

      const legPositions = [
        [-size[0] / 2 + 0.1, -size[1] * 0.35, size[2] / 2 - 0.1],
        [size[0] / 2 - 0.1, -size[1] * 0.35, size[2] / 2 - 0.1],
        [-size[0] / 2 + 0.1, -size[1] * 0.35, -size[2] / 2 + 0.1],
        [size[0] / 2 - 0.1, -size[1] * 0.35, -size[2] / 2 - 0.1],
      ]

      legPositions.forEach((pos) => {
        const leg = new THREE.Mesh(legGeometry, legMaterial)
        leg.position.set(...pos)
        leg.castShadow = true
        leg.receiveShadow = true
        group.add(leg)
      })
    },
    [createFabricTexture, createWoodTexture, darkenColor],
  )

  // Create a coffee table
  const createCoffeeTable = useCallback(
    (group: THREE.Group, size: number[], color: string) => {
      // Table top
      const topGeometry = new THREE.BoxGeometry(size[0], size[1] * 0.2, size[2])
      const mainMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.4,
        metalness: 0.2,
        map: createMarbleTexture(),
      })
      const top = new THREE.Mesh(topGeometry, mainMaterial)
      top.position.y = size[1] * 0.4
      top.castShadow = true
      top.receiveShadow = true
      group.add(top)

      // Legs
      const legGeometry = new THREE.CylinderGeometry(0.04, 0.04, size[1] * 0.8, 8)
      const legMaterial = new THREE.MeshStandardMaterial({
        color: darkenColor(color, 20),
        roughness: 0.3,
        metalness: 0.3,
        map: createWoodTexture(),
      })

      const legPositions = [
        [-size[0] / 2 + 0.1, 0, size[2] / 2 - 0.1],
        [size[0] / 2 - 0.1, 0, size[2] / 2 - 0.1],
        [-size[0] / 2 + 0.1, 0, -size[2] / 2 + 0.1],
        [size[0] / 2 - 0.1, 0, -size[2] / 2 + 0.1],
      ]

      legPositions.forEach((pos) => {
        const leg = new THREE.Mesh(legGeometry, legMaterial)
        leg.position.set(...pos)
        leg.castShadow = true
        leg.receiveShadow = true
        group.add(leg)
      })

      // Lower shelf
      const shelfGeometry = new THREE.BoxGeometry(size[0] * 0.9, size[1] * 0.1, size[2] * 0.9)
      const shelfMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.6,
        map: createWoodTexture(),
      })
      const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial)
      shelf.position.y = size[1] * 0.1
      shelf.castShadow = true
      shelf.receiveShadow = true
      group.add(shelf)

      // Add decorative details - a small book and a bowl
      // Book
      const bookGeometry = new THREE.BoxGeometry(size[0] * 0.25, size[1] * 0.1, size[2] * 0.2)
      const bookMaterial = new THREE.MeshStandardMaterial({
        color: "#7c3d25",
        roughness: 0.9,
      })
      const book = new THREE.Mesh(bookGeometry, bookMaterial)
      book.position.set(-size[0] * 0.2, size[1] * 0.55, 0)
      book.rotation.y = 0.3
      book.castShadow = true
      book.receiveShadow = true
      group.add(book)

      // Decorative bowl
      const bowlGeometry = new THREE.CylinderGeometry(size[0] * 0.15, size[0] * 0.2, size[1] * 0.1, 16, 1, true)
      const bowlMaterial = new THREE.MeshStandardMaterial({
        color: "#e0e0e0",
        roughness: 0.2,
        metalness: 0.8,
      })
      const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial)
      bowl.position.set(size[0] * 0.2, size[1] * 0.55, 0)
      bowl.castShadow = true
      bowl.receiveShadow = true
      group.add(bowl)
    },
    [createMarbleTexture, createWoodTexture, darkenColor],
  )

  // Create a bookshelf
  const createBookshelf = useCallback(
    (group: THREE.Group, size: number[], color: string) => {
      // Main structure
      const shelfGeometry = new THREE.BoxGeometry(size[0], size[1], size[2])
      const mainMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.6,
        map: createWoodTexture(),
      })
      const main = new THREE.Mesh(shelfGeometry, mainMaterial)
      main.castShadow = true
      main.receiveShadow = true
      group.add(main)

      // Shelves
      const shelfCount = 4
      const shelfHeight = size[1] / shelfCount

      for (let i = 1; i < shelfCount; i++) {
        const shelfGeo = new THREE.BoxGeometry(size[0] - 0.1, 0.05, size[2] - 0.05)
        const shelf = new THREE.Mesh(shelfGeo, mainMaterial)
        shelf.position.set(0, -size[1] / 2 + i * shelfHeight, 0)
        shelf.castShadow = true
        shelf.receiveShadow = true
        group.add(shelf)
      }

      // Back panel
      const backGeometry = new THREE.BoxGeometry(size[0] - 0.1, size[1] - 0.1, 0.05)
      const backPanel = new THREE.Mesh(backGeometry, mainMaterial)
      backPanel.position.z = -size[2] / 2 + 0.05
      backPanel.receiveShadow = true
      group.add(backPanel)

      // Add some books for decoration - use fixed colors to prevent changing
      const bookColors = [
        "#854442", // Red
        "#2a623d", // Green
        "#3a4e7a", // Blue
        "#76323f", // Burgundy
        "#c09f80", // Tan
        "#7d5a38", // Brown
        "#5d4037", // Dark Brown
      ]

      const bookPositions = [
        [-size[0] * 0.3, -size[1] * 0.3, 0],
        [0, -size[1] * 0.3, 0],
        [size[0] * 0.3, -size[1] * 0.3, 0],
        [-size[0] * 0.2, -size[1] * 0.1, 0],
        [size[0] * 0.2, -size[1] * 0.1, 0],
        [0, size[1] * 0.1, 0],
        [-size[0] * 0.25, size[1] * 0.3, 0],
      ]

      // Create books with fixed dimensions and colors
      bookPositions.forEach((pos, idx) => {
        const bookWidth = 0.15
        const bookHeight = 0.2
        const bookDepth = 0.1

        const bookGeometry = new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth)
        const bookMaterial = new THREE.MeshStandardMaterial({
          color: bookColors[idx % bookColors.length],
          roughness: 0.9,
        })
        const book = new THREE.Mesh(bookGeometry, bookMaterial)
        book.position.set(...pos)
        book.castShadow = true
        book.receiveShadow = true
        group.add(book)

        // Store the original color in userData to prevent changes
        book.userData.originalColor = bookColors[idx % bookColors.length]
      })
    },
    [createWoodTexture],
  )

  // Create a floor lamp
  const createFloorLamp = useCallback(
    (group: THREE.Group, size: number[], color: string) => {
      // Base
      const baseGeometry = new THREE.CylinderGeometry(size[0] * 1.5, size[0] * 1.8, size[1] * 0.05, 16)
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: "#555555",
        roughness: 0.4,
      })
      const base = new THREE.Mesh(baseGeometry, baseMaterial)
      base.position.y = -size[1] / 2 + 0.025
      base.castShadow = true
      base.receiveShadow = true
      group.add(base)

      // Pole
      const poleGeometry = new THREE.CylinderGeometry(size[0] * 0.1, size[0] * 0.1, size[1] * 0.9, 8)
      const poleMaterial = new THREE.MeshStandardMaterial({
        color: "#888888",
        roughness: 0.3,
      })
      const pole = new THREE.Mesh(poleGeometry, poleMaterial)
      pole.position.y = -size[1] * 0.05
      pole.castShadow = true
      pole.receiveShadow = true
      group.add(pole)

      // Shade
      const shadeGeometry = new THREE.CylinderGeometry(size[0] * 1.2, size[0] * 1.5, size[1] * 0.3, 16, 1, true)
      const shadeMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.8,
        side: THREE.DoubleSide,
        map: createFabricTexture(color),
      })
      const shade = new THREE.Mesh(shadeGeometry, shadeMaterial)
      shade.position.y = size[1] * 0.4
      shade.castShadow = true
      shade.receiveShadow = true
      group.add(shade)

      // Light
      const light = new THREE.PointLight(0xffffbb, 0.7, 10)
      light.position.set(0, size[1] * 0.4, 0)
      light.castShadow = true
      group.add(light)
    },
    [createFabricTexture],
  )

  // Create a TV stand
  const createTVStand = useCallback(
    (group: THREE.Group, size: number[], color: string) => {
      // Main cabinet
      const cabinetGeometry = new THREE.BoxGeometry(size[0], size[1], size[2])
      const mainMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.6,
        map: createWoodTexture(),
      })
      const cabinet = new THREE.Mesh(cabinetGeometry, mainMaterial)
      cabinet.castShadow = true
      cabinet.receiveShadow = true
      group.add(cabinet)

      // Cabinet doors
      const doorWidth = size[0] * 0.45
      const doorHeight = size[1] * 0.4
      const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, size[2] * 0.05)

      // Left door
      const leftDoor = new THREE.Mesh(doorGeometry, mainMaterial)
      leftDoor.position.set(-size[0] / 4, -size[1] / 4, size[2] / 2 - 0.025)
      leftDoor.castShadow = true
      leftDoor.receiveShadow = true
      group.add(leftDoor)

      // Right door
      const rightDoor = new THREE.Mesh(doorGeometry, mainMaterial)
      rightDoor.position.set(size[0] / 4, -size[1] / 4, size[2] / 2 - 0.025)
      rightDoor.castShadow = true
      rightDoor.receiveShadow = true
      group.add(rightDoor)

      // Handles
      const handleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8)
      const handleMaterial = new THREE.MeshStandardMaterial({
        color: "#dddddd",
        roughness: 0.2,
        metalness: 0.8,
      })

      const leftHandle = new THREE.Mesh(handleGeometry, handleMaterial)
      leftHandle.rotation.x = Math.PI / 2
      leftHandle.position.set(-size[0] / 8, -size[1] / 4, size[2] / 2 + 0.03)
      leftHandle.castShadow = true
      group.add(leftHandle)

      const rightHandle = new THREE.Mesh(handleGeometry, handleMaterial)
      rightHandle.rotation.x = Math.PI / 2
      rightHandle.position.set(size[0] / 8, -size[1] / 4, size[2] / 2 + 0.03)
      rightHandle.castShadow = true
      group.add(rightHandle)
    },
    [createWoodTexture],
  )

  // Create a plant
  const createPlant = useCallback((group: THREE.Group, size: number[], color: string) => {
    // Pot
    const potGeometry = new THREE.CylinderGeometry(size[0] * 0.7, size[0] * 0.8, size[1] * 0.3, 16)
    const potMaterial = new THREE.MeshStandardMaterial({
      color: "#a63c06",
      roughness: 0.8,
    })
    const pot = new THREE.Mesh(potGeometry, potMaterial)
    pot.position.y = -size[1] * 0.35
    pot.castShadow = true
    pot.receiveShadow = true
    group.add(pot)

    // Soil
    const soilGeometry = new THREE.CylinderGeometry(size[0] * 0.65, size[0] * 0.65, 0.05, 16)
    const soilMaterial = new THREE.MeshStandardMaterial({
      color: "#3a2817",
      roughness: 1,
    })
    const soil = new THREE.Mesh(soilGeometry, soilMaterial)
    soil.position.y = -size[1] * 0.2
    soil.receiveShadow = true
    group.add(soil)

    // Plant foliage - optimized with fewer vertices
    const foliageGeometry = new THREE.SphereGeometry(size[0] * 0.8, 12, 12)
    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.9,
    })
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial)
    foliage.position.y = size[1] * 0.3
    foliage.scale.y = 1.5
    foliage.castShadow = true
    group.add(foliage)

    // Add some variation to the foliage - fewer sub-spheres for better performance
    for (let i = 0; i < 3; i++) {
      const smallFoliageGeometry = new THREE.SphereGeometry(size[0] * 0.4, 8, 8)
      const smallFoliage = new THREE.Mesh(smallFoliageGeometry, foliageMaterial)
      const angle = (i * Math.PI * 2) / 3
      const radius = size[0] * 0.5
      smallFoliage.position.set(Math.cos(angle) * radius, size[1] * (0.4 + i * 0.2), Math.sin(angle) * radius)
      smallFoliage.scale.y = 1.2
      smallFoliage.castShadow = true
      group.add(smallFoliage)
    }
  }, [])

  // Create an area rug
  const createAreaRug = useCallback(
    (group: THREE.Group, size: number[], color: string) => {
      // Rug base - simplified geometry
      const rugGeometry = new THREE.BoxGeometry(size[0], size[1], size[2])
      const mainMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.9,
        map: createCarpetTexture(color),
      })
      const rug = new THREE.Mesh(rugGeometry, mainMaterial)
      rug.receiveShadow = true
      group.add(rug)

      // Border
      const borderWidth = 0.2
      const innerWidth = size[0] - 2 * borderWidth
      const innerDepth = size[2] - 2 * borderWidth

      const borderGeometry = new THREE.BoxGeometry(innerWidth, size[1] + 0.01, innerDepth)
      const borderMaterial = new THREE.MeshStandardMaterial({
        color: darkenColor(color, 15),
        roughness: 0.9,
        map: createCarpetTexture(darkenColor(color, 15)),
      })

      const border = new THREE.Mesh(borderGeometry, borderMaterial)
      border.position.y = 0.005
      border.receiveShadow = true
      group.add(border)
    },
    [createCarpetTexture, darkenColor],
  )

  // Create a side table
  const createSideTable = useCallback(
    (group: THREE.Group, size: number[], color: string) => {
      // Table top
      const topGeometry = new THREE.CylinderGeometry(size[0] * 0.5, size[0] * 0.5, size[1] * 0.1, 16)
      const topMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.5,
        map: createWoodTexture(),
      })
      const top = new THREE.Mesh(topGeometry, topMaterial)
      top.position.y = size[1] * 0.45
      top.castShadow = true
      top.receiveShadow = true
      group.add(top)

      // Table leg
      const legGeometry = new THREE.CylinderGeometry(size[0] * 0.08, size[0] * 0.08, size[1] * 0.9, 12)
      const legMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.4,
        map: createWoodTexture(),
      })
      const leg = new THREE.Mesh(legGeometry, legMaterial)
      leg.position.y = 0
      leg.castShadow = true
      leg.receiveShadow = true
      group.add(leg)

      // Base
      const baseGeometry = new THREE.CylinderGeometry(size[0] * 0.3, size[0] * 0.3, size[1] * 0.05, 16)
      const base = new THREE.Mesh(baseGeometry, legMaterial)
      base.position.y = -size[1] * 0.425
      base.castShadow = true
      base.receiveShadow = true
      group.add(base)
    },
    [createWoodTexture],
  )

  // Create an enhanced splatter painting
  const createSplatterPainting = useCallback(
    (group: THREE.Group, size: number[], color: string, wall = "left") => {
      // Frame
      const frameGeometry = new THREE.BoxGeometry(size[0], size[1], size[2])
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.5,
        metalness: 0.2,
      })
      const frame = new THREE.Mesh(frameGeometry, frameMaterial)
      frame.castShadow = true
      frame.receiveShadow = true
      group.add(frame)

      // Inner frame detail
      const innerFrameGeometry = new THREE.BoxGeometry(size[0] * 0.9, size[1] * 0.9, size[2] * 1.01)
      const innerFrameMaterial = new THREE.MeshStandardMaterial({
        color: darkenColor(color, 15),
        roughness: 0.4,
        metalness: 0.3,
      })
      const innerFrame = new THREE.Mesh(innerFrameGeometry, innerFrameMaterial)
      innerFrame.position.z = size[2] * 0.01
      innerFrame.castShadow = true
      innerFrame.receiveShadow = true
      group.add(innerFrame)

      // Art canvas with enhanced splatter painting texture
      const artGeometry = new THREE.PlaneGeometry(size[0] * 0.85, size[1] * 0.85)
      const artMaterial = new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.9,
        metalness: 0.1,
        map: createSplatterPaintingTexture(),
      })
      const art = new THREE.Mesh(artGeometry, artMaterial)

      // Position based on which wall it's on
      if (wall === "left") {
        art.position.z = size[2] * 0.51
        art.rotation.y = 0
      } else {
        art.position.z = -size[2] * 0.51
        art.rotation.y = Math.PI
      }

      art.receiveShadow = true
      group.add(art)

      // Store the wall position in userData for later reference
      group.userData.wall = wall
    },
    [createSplatterPaintingTexture, darkenColor],
  )

  // Create a TV
  const createTV = useCallback(
    (group: THREE.Group, size: number[], color: string) => {
      // TV frame
      const frameGeometry = new THREE.BoxGeometry(size[0], size[1], size[2])
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.4,
        metalness: 0.5,
      })
      const frame = new THREE.Mesh(frameGeometry, frameMaterial)
      frame.castShadow = true
      frame.receiveShadow = true
      group.add(frame)

      // TV screen
      const screenGeometry = new THREE.BoxGeometry(size[0] * 0.95, size[1] * 0.9, size[2] * 0.1)
      const screenMaterial = new THREE.MeshStandardMaterial({
        color: "#000000",
        roughness: 0.1,
        metalness: 0.8,
        emissive: "#3060a0",
        emissiveIntensity: 0.2,
      })
      const screen = new THREE.Mesh(screenGeometry, screenMaterial)
      screen.position.z = size[2] * 0.45
      screen.castShadow = true
      screen.receiveShadow = true
      group.add(screen)

      // TV content
      const contentGeometry = new THREE.PlaneGeometry(size[0] * 0.9, size[1] * 0.85)
      const contentMaterial = new THREE.MeshBasicMaterial({
        map: createTVContentTexture(),
        emissive: "#ffffff",
        emissiveIntensity: 0.5,
      })
      const content = new THREE.Mesh(contentGeometry, contentMaterial)
      content.position.z = size[2] * 0.46
      group.add(content)

      // Add a subtle glow
      const glowGeometry = new THREE.PlaneGeometry(size[0] * 1.05, size[1] * 1)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x3060a0,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
      })
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      glow.position.z = size[2] * 0.47
      group.add(glow)
    },
    [createTVContentTexture],
  )

  // Create furniture based on type
  const createFurniture = useCallback(
    (item: any) => {
      const { name, size, color } = item
      const group = new THREE.Group()

      switch (name) {
        case "Modern Sofa":
        case "Sofa":
          createSofa(group, size, color)
          break
        case "Coffee Table":
          createCoffeeTable(group, size, color)
          break
        case "Bookshelf":
          createBookshelf(group, size, color)
          break
        case "Armchair":
          createArmchair(group, size, color)
          break
        case "Floor Lamp":
          createFloorLamp(group, size, color)
          break
        case "TV Stand":
          createTVStand(group, size, color)
          break
        case "Plant":
          createPlant(group, size, color)
          break
        case "Area Rug":
          createAreaRug(group, size, color)
          break
        case "Side Table":
          createSideTable(group, size, color)
          break
        case "Abstract Art":
        case "Splatter Painting":
          createSplatterPainting(group, size, color, item.wall || "left")
          break
        case "Smart TV":
        case "TV":
          createTV(group, size, color)
          break
        default:
          // Default box for anything else
          const geometry = new THREE.BoxGeometry(size[0], size[1], size[2])
          const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.7,
          })
          const mesh = new THREE.Mesh(geometry, material)
          mesh.castShadow = true
          mesh.receiveShadow = true
          group.add(mesh)
      }

      return group
    },
    [
      createArmchair,
      createAreaRug,
      createBookshelf,
      createCoffeeTable,
      createFloorLamp,
      createPlant,
      createSideTable,
      createSofa,
      createSplatterPainting,
      createTV,
      createTVStand,
    ],
  )

  // Create an enhanced rotation control with 30-degree increments
  const createRotationControl = useCallback((object: THREE.Group, isRKeyMode = false) => {
    if (!object) return

    const rotatorGroup = new THREE.Group()

    // Get the size of the object from userData
    const size = object.userData.size || [1, 1, 1]
    // Increase radius when in R key mode for better visibility
    const radius = Math.max(size[0], size[2]) * (isRKeyMode ? 1.8 : 1.2)

    // Create a circular track with different appearance based on mode
    const trackGeometry = new THREE.TorusGeometry(radius, isRKeyMode ? 0.1 : 0.05, 16, 64)
    const trackMaterial = new THREE.MeshBasicMaterial({
      color: isRKeyMode ? 0x00dd00 : 0x00ff00,
      transparent: true,
      opacity: isRKeyMode ? 0.8 : 0.5,
    })
    const track = new THREE.Mesh(trackGeometry, trackMaterial)
    track.rotation.x = Math.PI / 2
    track.position.y = 0.05
    rotatorGroup.add(track)

    // Create rotation markers for 30-degree increments
    const markersGroup = new THREE.Group()
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12
      // Larger markers in R key mode
      const markerSize = isRKeyMode ? 0.15 : 0.08
      const markerGeometry = new THREE.BoxGeometry(markerSize, markerSize, markerSize)
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: isRKeyMode ? 0x00ff00 : 0x00ff00,
        transparent: true,
        opacity: isRKeyMode ? 0.9 : 0.6,
      })
      const marker = new THREE.Mesh(markerGeometry, markerMaterial)

      // Position markers around the circle
      marker.position.set(Math.cos(angle) * radius, 0.05, Math.sin(angle) * radius)

      // Add text labels for angles in R key mode
      if (isRKeyMode) {
        const degrees = Math.round((angle * 180) / Math.PI)
        const labelGeometry = new THREE.PlaneGeometry(0.3, 0.15)
        const canvas = document.createElement("canvas")
        canvas.width = 64
        canvas.height = 32
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.fillStyle = "#00ff00"
          ctx.font = "bold 24px Arial"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(`${degrees}°`, 32, 16)

          const texture = new THREE.CanvasTexture(canvas)
          const labelMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
          })

          const label = new THREE.Mesh(labelGeometry, labelMaterial)
          label.position.set(Math.cos(angle) * (radius + 0.4), 0.05, Math.sin(angle) * (radius + 0.4))
          label.lookAt(new THREE.Vector3(0, 0.05, 0))
          markersGroup.add(label)
        }
      }

      markersGroup.add(marker)
    }
    rotatorGroup.add(markersGroup)
    rotationMarkersRef.current = markersGroup

    // Create a larger, more visible handle - even larger in R key mode
    const handleGeometry = new THREE.SphereGeometry(isRKeyMode ? 0.25 : 0.12, 16, 16)
    const handleMaterial = new THREE.MeshBasicMaterial({
      color: isRKeyMode ? 0x00ff00 : 0x00ff00,
      transparent: true,
      opacity: isRKeyMode ? 1.0 : 0.8,
    })
    const handle = new THREE.Mesh(handleGeometry, handleMaterial)
    handle.position.set(radius, 0.05, 0)
    rotatorGroup.add(handle)

    // Add a direction indicator to show rotation direction
    const arrowGeometry = new THREE.ConeGeometry(isRKeyMode ? 0.15 : 0.08, isRKeyMode ? 0.3 : 0.16, 8)
    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: isRKeyMode ? 0xffffff : 0xdddddd,
      transparent: true,
      opacity: isRKeyMode ? 1.0 : 0.8,
    })
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial)
    arrow.rotation.z = -Math.PI / 2
    arrow.position.set(radius + (isRKeyMode ? 0.4 : 0.2), 0.05, 0)
    rotatorGroup.add(arrow)

    // Position the rotator at the object's position
    rotatorGroup.position.copy(object.position)
    rotatorGroup.position.y = 0.05

    return rotatorGroup
  }, [])

  // Replace the snapToNearestIncrement function with this more precise version
  const snapToNearestIncrement = useCallback((angle: number): number => {
    const increment = Math.PI / 6 // 30 degrees in radians
    // Normalize angle to 0-2π range
    const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    return Math.round(normalizedAngle / increment) * increment
  }, [])

  // Throttled mouse move handler for better performance
  const throttledMouseMove = useCallback(
    throttle((event: MouseEvent) => {
      if (!rendererRef.current || !cameraRef.current) return

      const rect = rendererRef.current.domElement.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      if (isDraggingRef.current && selectedObjectRef.current && editMode) {
        // Determine interaction mode based on R key state
        const currentMode = false

        if (currentMode === "rotate" || isRotatingRef.current) {
          // Update the rotation handling section in the throttledMouseMove function
          // Find this section in the throttledMouseMove function:
          // Replace with this improved rotation handling:
          // Rotation mode - using the rotation control
          raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)

          // Calculate angle from center of object to mouse position
          const planeIntersects = raycasterRef.current.intersectObject(planeRef.current!)
          if (planeIntersects.length > 0) {
            const point = planeIntersects[0].point
            const center = selectedObjectRef.current.position.clone()

            // If we're just starting rotation, store the initial angle

            // Calculate angle
            const currentAngle = Math.atan2(point.x - center.x, point.z - center.z)

            // Calculate rotation delta if we're in locked rotation mode
            const targetAngle = currentAngle

            // Snap to nearest 30-degree increment
            const snappedAngle = snapToNearestIncrement(targetAngle)

            // Apply rotation
            selectedObjectRef.current.rotation.y = snappedAngle

            // Update current rotation angle for UI display
            setCurrentRotationAngle(snappedAngle)

            // Update outline and rotator
            if (outlineRef.current) {
              outlineRef.current.rotation.y = snappedAngle
            }

            if (rotatorRef.current) {
              rotatorRef.current.rotation.y = snappedAngle
            }
          }
        } else {
          // Drag mode - move the furniture
          raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)

          // Find intersection with the drag plane
          const intersects = raycasterRef.current.intersectObject(planeRef.current!)
          if (intersects.length > 0) {
            // Calculate new position
            const newPosition = intersects[0].point.clone().sub(dragOffsetRef.current)

            // Store original position
            const originalPosition = selectedObjectRef.current.position.clone()

            // Check room boundaries
            const objectId = selectedObjectRef.current.userData.id
            const item = furniture.find((item) => item.id === objectId)
            if (!item) return

            const halfWidth = item.size[0] / 2
            const halfDepth = item.size[2] / 2

            // Get room size from scene
            const roomSize = 8

            // Constrain to room bounds
            newPosition.x = Math.max(-roomSize / 2 + halfWidth, Math.min(roomSize / 2 - halfWidth, newPosition.x))
            newPosition.z = Math.max(-roomSize / 2 + halfDepth, Math.min(roomSize / 2 - halfDepth, newPosition.z))

            // Special handling for the painting - snap to walls
            if (item.name === "Abstract Art" || item.name === "Splatter Painting") {
              // Check which wall is closer
              const distanceToLeftWall = Math.abs(newPosition.x - -roomSize / 2)
              const distanceToBackWall = Math.abs(newPosition.z - -roomSize / 2)

              if (distanceToLeftWall < distanceToBackWall) {
                // Snap to left wall
                newPosition.x = -roomSize / 2 + item.size[0] / 2
                selectedObjectRef.current.rotation.y = 0

                // Update wall property
                selectedObjectRef.current.userData.wall = "left"

                // Update the painting orientation
                const children = selectedObjectRef.current.children
                for (let i = 0; i < children.length; i++) {
                  if (children[i].geometry instanceof THREE.PlaneGeometry) {
                    children[i].position.z = item.size[2] * 0.51
                    children[i].position.x = 0
                    children[i].rotation.y = 0
                  }
                }
              } else {
                // Snap to back wall
                newPosition.z = -roomSize / 2 + item.size[0] / 2
                selectedObjectRef.current.rotation.y = Math.PI / 2

                // Update wall property
                selectedObjectRef.current.userData.wall = "back"

                // Update the painting orientation
                const children = selectedObjectRef.current.children
                for (let i = 0; i < children.length; i++) {
                  if (children[i].geometry instanceof THREE.PlaneGeometry) {
                    children[i].position.z = 0
                    children[i].position.x = item.size[2] * 0.51
                    children[i].rotation.y = Math.PI / 2
                  }
                }
              }
            }

            // Prevent plant from rotating unexpectedly
            if (item.name === "Plant") {
              // Keep the original rotation
              const originalRotation = selectedObjectRef.current.rotation.clone()

              // Update position
              selectedObjectRef.current.position.x = newPosition.x
              selectedObjectRef.current.position.z = newPosition.z

              // Restore original rotation
              selectedObjectRef.current.rotation.copy(originalRotation)
            } else {
              // Update position for other items
              selectedObjectRef.current.position.x = newPosition.x
              selectedObjectRef.current.position.z = newPosition.z
            }

            // Update outline position
            if (outlineRef.current) {
              outlineRef.current.position.x = newPosition.x
              outlineRef.current.position.z = newPosition.z
            }

            // Update rotator position
            if (rotatorRef.current) {
              rotatorRef.current.position.x = newPosition.x
              rotatorRef.current.position.z = newPosition.z
            }

            // Update bounding box
            boundingBoxes.current[objectId].setFromObject(selectedObjectRef.current)

            // Check for collisions
            let collision = false
            for (const [id, box] of Object.entries(boundingBoxes.current)) {
              if (id !== objectId.toString() && boundingBoxes.current[objectId].intersectsBox(box)) {
                collision = true
                break
              }
            }

            // If collision, revert position
            if (collision) {
              selectedObjectRef.current.position.copy(originalPosition)

              if (outlineRef.current) {
                outlineRef.current.position.copy(originalPosition)
              }

              if (rotatorRef.current) {
                rotatorRef.current.position.copy(originalPosition)
              }

              boundingBoxes.current[objectId].setFromObject(selectedObjectRef.current)
            }
          }
        }
      }

      // Hover effect
      if (!isDraggingRef.current && editMode) {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)

        // Check for intersections with furniture
        const furnitureObjects = Object.values(furnitureRefs.current)
        const intersects = raycasterRef.current.intersectObjects(furnitureObjects, true)

        // Reset cursor
        document.body.style.cursor = "default"

        // If hovering over furniture, change cursor
        if (intersects.length > 0) {
          let hoverObject = intersects[0].object
          while (hoverObject && !hoverObject.userData.type) {
            hoverObject = hoverObject.parent as THREE.Group
          }

          if (hoverObject && hoverObject.userData.type === "furniture") {
            document.body.style.cursor = "pointer"
          }
        }

        // Check for intersections with rotation control
        if (rotatorRef.current) {
          const rotatorIntersects = raycasterRef.current.intersectObject(rotatorRef.current, true)
          if (rotatorIntersects.length > 0) {
            document.body.style.cursor = "grab"
            setShowRotationGuide(true)
          } else {
            setShowRotationGuide(false)
          }
        }
      }
    }, 10), // Reduce throttle time from 16ms to 10ms for smoother interaction
    [editMode, furniture, snapToNearestIncrement],
  )

  // Update FPS counter
  const updateFPS = useCallback(() => {
    if (!showFpsRef.current || !fpsCounterRef.current) return

    frameCountRef.current++
    const now = Date.now()
    const elapsed = now - lastTimeRef.current

    if (elapsed >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / elapsed)
      fpsCounterRef.current.textContent = `${fps} FPS`
      frameCountRef.current = 0
      lastTimeRef.current = now
    }
  }, [])

  // Function to manually deselect the current item
  const clearSelection = useCallback(() => {
    setSelectedItem(null)
    selectedObjectRef.current = null

    if (outlineRef.current && sceneRef.current) {
      sceneRef.current.remove(outlineRef.current)
      outlineRef.current = null
    }

    if (rotatorRef.current && sceneRef.current) {
      sceneRef.current.remove(rotatorRef.current)
      rotatorRef.current = null
    }
  }, [])

  // Update rotation control when R key state changes
  useEffect(() => {}, [])

  useEffect(() => {
    if (instructions) {
      const timer = setTimeout(() => {
        setInstructions(false)
      }, 5000) // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer)
    }
  }, [instructions])

  useEffect(() => {
    if (!mountRef.current) return

    // Get container dimensions
    const width = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight

    // Create scene with optimized settings
    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#f0f0f0")
    sceneRef.current = scene

    // Optimize memory usage by setting frustumCulled to true for all objects
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.frustumCulled = true
      }
    })

    // Create camera with fixed position as requested
    const camera = new THREE.OrthographicCamera(width / -70, width / 70, height / 70, height / -70, 0.1, 1000)
    camera.position.set(6, 6, 6)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Create renderer with optimizations
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: true,
    })
    renderer.setSize(width, height)
    // Optimization for faster loading and better performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // Limit pixel ratio
    renderer.powerPreference = "high-performance"
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    // Enable optimizations
    renderer.sortObjects = false // Disable object sorting for better performance
    renderer.physicallyCorrectLights = false // Disable physically correct lighting for better performance
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Room setup
    const roomSize = 8
    const wallHeight = 3.5

    // Floor
    const floorGeometry = new THREE.BoxGeometry(roomSize, 0.1, roomSize)
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: "#3c2414",
      roughness: 0.8,
      metalness: 0.2,
      map: createWoodTexture(),
      normalScale: new THREE.Vector2(0.5, 0.5),
      envMapIntensity: 0.5,
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.position.y = -0.05
    floor.receiveShadow = true
    scene.add(floor)

    // Add a subtle reflection to the floor
    const floorReflection = new THREE.Mesh(
      new THREE.PlaneGeometry(roomSize, roomSize),
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.1,
      }),
    )
    floorReflection.rotation.x = -Math.PI / 2
    floorReflection.position.y = -0.04
    floorReflection.receiveShadow = true
    scene.add(floorReflection)

    // Add wood planks to floor
    const floorPattern = new THREE.Group()
    const plankWidth = 0.5
    const plankMaterial = new THREE.MeshStandardMaterial({
      color: "#241505",
      roughness: 0.8,
      metalness: 0.1,
      map: createWoodTexture(),
    })

    for (let x = -roomSize / 2 + plankWidth / 2; x < roomSize / 2; x += plankWidth) {
      const plankGeometry = new THREE.BoxGeometry(plankWidth - 0.05, 0.11, roomSize)
      const plank = new THREE.Mesh(plankGeometry, plankMaterial)
      plank.position.set(x, -0.05, 0)
      plank.receiveShadow = true
      floorPattern.add(plank)
    }
    scene.add(floorPattern)

    // Invisible plane for drag operations
    const dragPlaneGeometry = new THREE.PlaneGeometry(roomSize, roomSize)
    const dragPlaneMaterial = new THREE.MeshBasicMaterial({ visible: false })
    const dragPlane = new THREE.Mesh(dragPlaneGeometry, dragPlaneMaterial)
    dragPlane.rotation.x = -Math.PI / 2
    dragPlane.position.y = 0
    planeRef.current = dragPlane
    scene.add(dragPlane)

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: "#f5f5f5",
      roughness: 0.9,
      metalness: 0.1,
      map: createFabricTexture("#f5f5f5"),
    })

    // Back wall
    const backWallGeometry = new THREE.BoxGeometry(roomSize, wallHeight, 0.1)
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial)
    backWall.position.set(0, wallHeight / 2, -roomSize / 2)
    backWall.receiveShadow = true
    scene.add(backWall)

    // Left wall
    const leftWallGeometry = new THREE.BoxGeometry(0.1, wallHeight, roomSize)
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial)
    leftWall.position.set(-roomSize / 2, wallHeight / 2, 0)
    leftWall.receiveShadow = true
    scene.add(leftWall)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6) // Increased from 0.4
    scene.add(ambientLight)

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffecd9, 1.0) // Increased from 0.8
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048 // Increased from 1024
    directionalLight.shadow.mapSize.height = 2048 // Increased from 1024
    directionalLight.shadow.bias = -0.0005
    scene.add(directionalLight)

    // Fill light
    const fillLight = new THREE.PointLight(0xffb766, 0.6, 15) // Increased from 0.4
    fillLight.position.set(-3, 5, 0)
    scene.add(fillLight)

    // Add a subtle rim light for more dimension
    const rimLight = new THREE.PointLight(0xadd8e6, 0.5, 20)
    rimLight.position.set(0, 3, 6)
    scene.add(rimLight)

    // Selection outline material
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.5,
    })

    // Create furniture
    furniture.forEach((item) => {
      const furnitureObj = createFurniture(item)
      furnitureObj.position.set(item.position[0], item.position[1], item.position[2])
      furnitureObj.rotation.y = item.rotation
      furnitureObj.userData = {
        id: item.id,
        type: "furniture",
        originalColor: item.color,
        size: item.size,
        wall: item.wall,
      }
      scene.add(furnitureObj)
      furnitureRefs.current[item.id] = furnitureObj

      // Create bounding box for collision detection
      const box = new THREE.Box3().setFromObject(furnitureObj)
      boundingBoxes.current[item.id] = box
    })

    // Mouse events
    const onMouseDown = (event: MouseEvent) => {
      if (!rendererRef.current || !editMode) return

      const rect = rendererRef.current.domElement.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      if (event.button === 0) {
        // Left mouse button
        raycasterRef.current.setFromCamera(mouseRef.current, camera)

        // Get all furniture objects
        const furnitureObjects = Object.values(furnitureRefs.current)

        // Intersect with furniture objects
        const intersects = raycasterRef.current.intersectObjects(furnitureObjects, true)

        if (intersects.length > 0) {
          // Find the parent furniture object
          let selectedObject = intersects[0].object
          while (selectedObject && !selectedObject.userData.type) {
            selectedObject = selectedObject.parent as THREE.Group
          }

          if (selectedObject && selectedObject.userData.type === "furniture") {
            // Remove any existing outline
            if (outlineRef.current) {
              scene.remove(outlineRef.current)
              outlineRef.current = null
            }

            // Remove any existing rotator
            if (rotatorRef.current) {
              scene.remove(rotatorRef.current)
              rotatorRef.current = null
            }

            // Set the furniture as selected
            const id = selectedObject.userData.id
            setSelectedItem(id)

            // Update current rotation angle for display
            setCurrentRotationAngle(selectedObject.rotation.y)

            // Create selection outline
            const size = selectedObject.userData.size || [1, 1, 1]
            const outlineGeometry = new THREE.BoxGeometry(size[0], size[1], size[2])
            const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial)
            outlineMesh.scale.set(1.05, 1.05, 1.05)

            // Position the outline
            outlineMesh.position.copy(selectedObject.position)
            outlineMesh.rotation.copy(selectedObject.rotation)

            scene.add(outlineMesh)
            outlineRef.current = outlineMesh

            // Setup for dragging
            isDraggingRef.current = true
            selectedObjectRef.current = selectedObject

            // Find intersection with the drag plane
            const planeIntersects = raycasterRef.current.intersectObject(dragPlane)
            if (planeIntersects.length > 0) {
              dragOffsetRef.current.copy(planeIntersects[0].point).sub(selectedObject.position)
              dragOffsetRef.current.y = 0 // Keep y-position unchanged
            }

            // Hide instructions after first interaction
            setInstructions(false)
          }
        }
      }
    }

    const onMouseMove = (event: MouseEvent) => {
      if (!rendererRef.current || !cameraRef.current) return

      const rect = rendererRef.current.domElement.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      if (isDraggingRef.current && selectedObjectRef.current && editMode) {
        // Drag mode - move the furniture
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)

        // Find intersection with the drag plane
        const intersects = raycasterRef.current.intersectObject(planeRef.current!)
        if (intersects.length > 0) {
          // Calculate new position
          const newPosition = intersects[0].point.clone().sub(dragOffsetRef.current)

          // Store original position
          const originalPosition = selectedObjectRef.current.position.clone()

          // Check room boundaries
          const objectId = selectedObjectRef.current.userData.id
          const item = furniture.find((item) => item.id === objectId)
          if (!item) return

          const halfWidth = item.size[0] / 2
          const halfDepth = item.size[2] / 2

          // Get room size from scene
          const roomSize = 8

          // Constrain to room bounds
          newPosition.x = Math.max(-roomSize / 2 + halfWidth, Math.min(roomSize / 2 - halfWidth, newPosition.x))
          newPosition.z = Math.max(-roomSize / 2 + halfDepth, Math.min(roomSize / 2 - halfDepth, newPosition.z))

          // Special handling for the painting - snap to walls
          if (item.name === "Abstract Art" || item.name === "Splatter Painting") {
            // Check which wall is closer
            const distanceToLeftWall = Math.abs(newPosition.x - -roomSize / 2)
            const distanceToBackWall = Math.abs(newPosition.z - -roomSize / 2)

            if (distanceToLeftWall < distanceToBackWall) {
              // Snap to left wall
              newPosition.x = -roomSize / 2 + item.size[0] / 2
              selectedObjectRef.current.rotation.y = 0

              // Update wall property
              selectedObjectRef.current.userData.wall = "left"

              // Update the painting orientation
              const children = selectedObjectRef.current.children
              for (let i = 0; i < children.length; i++) {
                if (children[i].geometry instanceof THREE.PlaneGeometry) {
                  children[i].position.z = item.size[2] * 0.51
                  children[i].position.x = 0
                  children[i].rotation.y = 0
                }
              }
            } else {
              // Snap to back wall
              newPosition.z = -roomSize / 2 + item.size[0] / 2
              selectedObjectRef.current.rotation.y = Math.PI / 2

              // Update wall property
              selectedObjectRef.current.userData.wall = "back"

              // Update the painting orientation
              const children = selectedObjectRef.current.children
              for (let i = 0; i < children.length; i++) {
                if (children[i].geometry instanceof THREE.PlaneGeometry) {
                  children[i].position.z = 0
                  children[i].position.x = item.size[2] * 0.51
                  children[i].rotation.y = Math.PI / 2
                }
              }
            }
          }

          // Prevent plant from rotating unexpectedly
          if (item.name === "Plant") {
            // Keep the original rotation
            const originalRotation = selectedObjectRef.current.rotation.clone()

            // Update position
            selectedObjectRef.current.position.x = newPosition.x
            selectedObjectRef.current.position.z = newPosition.z

            // Restore original rotation
            selectedObjectRef.current.rotation.copy(originalRotation)
          } else {
            // Update position for other items
            selectedObjectRef.current.position.x = newPosition.x
            selectedObjectRef.current.position.z = newPosition.z
          }

          // Update outline position
          if (outlineRef.current) {
            outlineRef.current.position.x = newPosition.x
            outlineRef.current.position.z = newPosition.z
          }

          // Update bounding box
          boundingBoxes.current[objectId].setFromObject(selectedObjectRef.current)

          // Check for collisions
          let collision = false
          for (const [id, box] of Object.entries(boundingBoxes.current)) {
            if (id !== objectId.toString() && boundingBoxes.current[objectId].intersectsBox(box)) {
              collision = true
              break
            }
          }

          // If collision, revert position
          if (collision) {
            selectedObjectRef.current.position.copy(originalPosition)

            if (outlineRef.current) {
              outlineRef.current.position.copy(originalPosition)
            }

            boundingBoxes.current[objectId].setFromObject(selectedObjectRef.current)
          }
        }
      }

      // Hover effect
      if (!isDraggingRef.current && editMode) {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)

        // Check for intersections with furniture
        const furnitureObjects = Object.values(furnitureRefs.current)
        const intersects = raycasterRef.current.intersectObjects(furnitureObjects, true)

        // Reset cursor
        document.body.style.cursor = "default"

        // If hovering over furniture, change cursor
        if (intersects.length > 0) {
          let hoverObject = intersects[0].object
          while (hoverObject && !hoverObject.userData.type) {
            hoverObject = hoverObject.parent as THREE.Group
          }

          if (hoverObject && hoverObject.userData.type === "furniture") {
            document.body.style.cursor = "pointer"
          }
        }
      }
    }

    const onMouseUp = () => {
      // If we were dragging and have a selected object, update the furniture state
      if (isDraggingRef.current && selectedObjectRef.current) {
        const objectId = selectedObjectRef.current.userData.id

        // Update furniture state with the final position and rotation
        setFurniture((prev) =>
          prev.map((item) => {
            if (item.id === objectId) {
              return {
                ...item,
                position: [
                  selectedObjectRef.current!.position.x,
                  selectedObjectRef.current!.position.y,
                  selectedObjectRef.current!.position.z,
                ],
                rotation: selectedObjectRef.current!.rotation.y, // Save the current rotation
                wall: selectedObjectRef.current!.userData.wall,
              }
            }
            return item
          }),
        )
      }

      isDraggingRef.current = false
      document.body.style.cursor = "default"
    }

    const onKeyDown = (event: KeyboardEvent) => {
      // Toggle edit mode with 'E' key
      if (event.key.toLowerCase() === "e") {
        setEditMode((prev) => !prev)

        // Clear selection when exiting edit mode
        if (editMode) {
          clearSelection()
        }
      }

      // Toggle FPS counter with 'F' key
      if (event.key.toLowerCase() === "f") {
        showFpsRef.current = !showFpsRef.current
        if (fpsCounterRef.current) {
          fpsCounterRef.current.style.display = showFpsRef.current ? "block" : "none"
        }
      }

      // Deselect with Escape key
      if (event.key === "Escape") {
        clearSelection()
      }

      // R key for rotation - rotate clockwise by 30 degrees
      if (event.key.toLowerCase() === "r" && selectedObjectRef.current) {
        // Prevent rapid key presses by requiring a small delay between rotations
        const now = Date.now()
        if (now - lastKeyPressTime < 150) return // 150ms delay between key presses
        setLastKeyPressTime(now)

        // Calculate the new rotation angle (current + 30 degrees)
        const currentRotation = selectedObjectRef.current.rotation.y
        const newRotation = currentRotation + Math.PI / 6 // 30 degrees in radians

        // Apply the rotation
        selectedObjectRef.current.rotation.y = newRotation

        // Update the UI display
        setCurrentRotationAngle(newRotation)

        // Update the outline rotation
        if (outlineRef.current) {
          outlineRef.current.rotation.y = newRotation
        }

        // Show a visual indicator of rotation
        setShowRotationGuide(true)
        setTimeout(() => setShowRotationGuide(false), 500)
      }

      // Add Shift+R for counterclockwise rotation
      if (event.key.toLowerCase() === "r" && event.shiftKey && selectedObjectRef.current) {
        // Prevent rapid key presses
        const now = Date.now()
        if (now - lastKeyPressTime < 150) return
        setLastKeyPressTime(now)

        // Calculate the new rotation angle (current - 30 degrees)
        const currentRotation = selectedObjectRef.current.rotation.y
        const newRotation = currentRotation - Math.PI / 6 // 30 degrees in radians

        // Apply the rotation
        selectedObjectRef.current.rotation.y = newRotation

        // Update the UI display
        setCurrentRotationAngle(newRotation)

        // Update the outline rotation
        if (outlineRef.current) {
          outlineRef.current.rotation.y = newRotation
        }

        // Show a visual indicator of rotation
        setShowRotationGuide(true)
        setTimeout(() => setShowRotationGuide(false), 500)
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {}

    // Add event listeners
    renderer.domElement.addEventListener("mousedown", onMouseDown)
    renderer.domElement.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    renderer.domElement.addEventListener("contextmenu", onContextMenu)
    window.addEventListener("keydown", onKeyDown)

    // Animation loop with performance optimization
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)

      // Only render when needed - add a check to reduce unnecessary renders
      if (isDraggingRef.current || isRotatingRef.current) {
        renderer.render(scene, camera)
      } else {
        // Render at a reduced rate when not interacting
        if (frameCountRef.current % 2 === 0) {
          renderer.render(scene, camera)
        }
      }

      // Update FPS counter
      updateFPS()

      frameCountRef.current++
    }

    animate()

    // Handle window resize
    const handleResize = debounce(() => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return

      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight

      cameraRef.current.left = width / -70
      cameraRef.current.right = width / 70
      cameraRef.current.top = height / 70
      cameraRef.current.bottom = height / -70
      cameraRef.current.updateProjectionMatrix()

      rendererRef.current.setSize(width, height)
    }, 250)

    window.addEventListener("resize", handleResize)

    // Set loaded state
    setIsLoaded(true)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      renderer.domElement.removeEventListener("mousedown", onMouseDown)
      renderer.domElement.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
      renderer.domElement.removeEventListener("contextmenu", onContextMenu)
      window.removeEventListener("keydown", onKeyDown)

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }

      // Clear texture cache
      Object.values(textureCache.current).forEach((texture) => {
        texture.dispose()
      })
      textureCache.current = {}
    }
  }, [
    createFabricTexture,
    createFurniture,
    createRotationControl,
    createWoodTexture,
    furniture,
    editMode,
    throttledMouseMove,
    updateFPS,
    instructions,
    clearSelection,
    snapToNearestIncrement,
  ])

  // Function to ensure furniture is properly oriented toward the TV
  const orientFurnitureTowardTV = useCallback(() => {
    const tvPosition = furniture.find((item) => item.name === "Smart TV")?.position
    if (!tvPosition) return

    // Create a temporary array to avoid direct state updates
    const updatedFurniture = [...furniture]
    let hasChanges = false

    // Update sofa and armchair to face the TV
    updatedFurniture.forEach((item) => {
      if (item.name === "Modern Sofa" || item.name === "Armchair") {
        // Calculate angle to face the TV
        const dx = tvPosition[0] - item.position[0]
        const dz = tvPosition[2] - item.position[2]
        const angle = Math.atan2(dx, dz)

        // Only update if the angle is different
        if (item.rotation !== angle) {
          item.rotation = angle
          hasChanges = true
        }
      }
    })

    // Only update state if changes were made
    if (hasChanges) {
      setFurniture(updatedFurniture)
    }
  }, [furniture])

  // Call this function once when the component mounts
  useEffect(() => {
    orientFurnitureTowardTV()
  }, [orientFurnitureTowardTV])

  // The UI component rendering starts here
  return (
    <TooltipProvider>
      <style dangerouslySetInnerHTML={{ __html: animationDelayStyle }} />
      <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-indigo-950 rounded-xl overflow-hidden">
        {/* Top Bar with controls */}
        <div className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <h2 className="text-base font-medium text-white">DreamSpace Designer</h2>
          </div>

          <div className="flex items-center space-x-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    editMode
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {editMode ? "Editing Active" : "View Mode"}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{editMode ? "Exit edit mode" : "Enter edit mode to modify room"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowControls(!showControls)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-200"
                  >
                    {showControls ? (
                      <>
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </>
                    ) : (
                      <>
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </>
                    )}
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{showControls ? "Hide controls" : "Show controls"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex-1 relative">
          {/* 3D Room Rendering Area */}
          <div className="absolute inset-0" ref={mountRef}></div>

          {/* Selected item details panel */}
          <AnimatePresence>
            {selectedItem && showControls && (
              <motion.div
                initial={{ x: -280, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -280, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="absolute top-4 left-4 w-64 bg-slate-800/80 backdrop-blur-md rounded-lg border border-white/10 p-4 text-white shadow-lg"
              >
                <h3 className="text-sm font-semibold mb-2 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
                  {furniture.find((i) => i.id === selectedItem)?.name || "Selected Item"}
                </h3>
                <div className="space-y-2 text-xs text-blue-200/90">
                  <p>Use the green ring to rotate the item in 30° increments</p>
                  <p>Drag anywhere on the item to reposition</p>
                  <p>
                    Hold <span className="bg-slate-700 px-1.5 py-0.5 rounded font-mono">R</span> key to switch to
                    rotation mode
                  </p>
                  <p>Press ESC key to deselect</p>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-blue-200/90">Position</span>
                    <span className="text-xs font-mono bg-slate-700 px-1.5 py-0.5 rounded">
                      {furniture
                        .find((i) => i.id === selectedItem)
                        ?.position.map((p) => p.toFixed(1))
                        .join(", ")}
                    </span>
                  </div>
                  {/* Update the rotation display in the selected item details panel */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-200/90">Rotation</span>
                    <span className="text-xs font-mono bg-slate-700 px-1.5 py-0.5 rounded">
                      {Math.round((currentRotationAngle * 180) / Math.PI) % 360}°
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-blue-200/90">Controls</span>
                    <span className="text-xs font-mono">
                      <span className="bg-slate-700 px-1.5 py-0.5 rounded mr-1">R</span>
                      <span className="text-slate-400">to rotate</span>
                    </span>
                  </div>
                  <button
                    onClick={clearSelection}
                    className="w-full mt-3 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
                  >
                    Deselect
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rotation guide tooltip */}
          <AnimatePresence>
            {showRotationGuide && selectedItem && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-green-800/90 backdrop-blur-md rounded-lg border border-green-500/30 px-4 py-2 text-white text-sm shadow-lg"
              >
                Rotated to {Math.round((currentRotationAngle * 180) / Math.PI) % 360}°
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls panel */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="absolute bottom-6 right-6 bg-slate-800/90 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-lg z-10"
          >
            <div className="flex flex-col">
              <ControlButton icon="help-circle" tooltip="Help" onClick={() => setInstructions(true)} />
            </div>
          </motion.div>

          {/* Instructions overlay */}
          <AnimatePresence>
            {instructions && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20"
                onClick={() => setInstructions(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-lg p-6 rounded-xl border border-blue-500/30 shadow-xl max-w-md text-white max-h-[80vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start mb-4">
                    <div className="bg-blue-500 p-2 rounded-lg mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Room Designer Controls</h3>
                      <p className="text-blue-200/90 text-sm">Interact with your virtual space</p>
                    </div>
                    <button
                      onClick={() => setInstructions(false)}
                      className="ml-auto p-1 rounded-full hover:bg-white/10"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white/70"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <InstructionItem
                      icon="mouse-pointer"
                      title="Select & Move"
                      description="Click on any furniture to select it, then drag to reposition"
                    />
                    <InstructionItem
                      icon="rotate-cw"
                      title="Rotate While Dragging"
                      description="While holding an item, press R to rotate clockwise, Shift+R for counterclockwise"
                    />
                    <InstructionItem
                      icon="edit-2"
                      title="Edit Mode"
                      description="Toggle edit mode using the button in the top bar"
                    />
                    <InstructionItem
                      icon="key"
                      title="Keyboard Controls"
                      description="Press 'E' to toggle edit mode, 'F' to show FPS counter, 'ESC' to deselect"
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-900 to-indigo-950 z-50">
              <div className="text-center max-w-md px-6">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-t-blue-500 border-r-blue-400 border-b-blue-300 border-l-blue-200 rounded-full animate-spin"></div>
                  <div className="absolute inset-3 border-4 border-t-indigo-400 border-r-indigo-300 border-b-indigo-200 border-l-transparent rounded-full animate-spin animation-delay-150"></div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Preparing Your Space</h3>
                <p className="text-blue-200 mb-4">Loading 3D environment and furniture...</p>
                <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )

  function onContextMenu(event: MouseEvent) {
    event.preventDefault()
  }
}

// Helper Components
function ControlButton({ icon, tooltip, onClick }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button onClick={onClick} className="p-3 hover:bg-white/10 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-200"
          >
            {icon === "zoom-in" && (
              <>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </>
            )}
            {icon === "zoom-out" && (
              <>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </>
            )}
            {icon === "rotate-ccw" && (
              <>
                <path d="M3 2v6h6"></path>
                <path d="M3 8a9 9 0 1 0 2.83-6.36L3 8"></path>
              </>
            )}
            {icon === "help-circle" && (
              <>
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </>
            )}
          </svg>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}

function InstructionItem({ icon, title, description }) {
  return (
    <div className="flex items-start">
      <div className="bg-blue-500/20 p-2 rounded mr-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-300"
        >
          {icon === "mouse-pointer" && (
            <>
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
              <path d="M13 13l6 6"></path>
            </>
          )}
          {icon === "rotate-cw" && (
            <>
              <path d="M21 2v6h6"></path>
              <path d="M21 13a9 9 0 1 1-3-7.7L21 8"></path>
            </>
          )}
          {icon === "edit-2" && (
            <>
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </>
          )}
          {icon === "key" && (
            <>
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
            </>
          )}
        </svg>
      </div>
      <div>
        <h4 className="text-sm font-medium text-white">{title}</h4>
        <p className="text-xs text-blue-200/90">{description}</p>
      </div>
    </div>
  )
}
