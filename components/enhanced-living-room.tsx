"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import * as THREE from "three"
import { debounce, throttle } from "lodash"

export default function EnhancedLivingRoom() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [instructions, setInstructions] = useState(true)
  const [editMode, setEditMode] = useState(true)

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  const planeRef = useRef<THREE.Mesh | null>(null)
  const outlineRef = useRef<THREE.Mesh | null>(null)
  const rotatorRef = useRef<THREE.Group | null>(null)
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
    { id: 1, name: "Sofa", color: "#5077a8", position: [0, 0.4, -1.5], size: [2.2, 0.8, 1], rotation: 0 },
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
      name: "Splatter Painting",
      color: "#d4a76a",
      position: [-3.38, 2, 0],
      size: [0.05, 1.2, 1.8],
      rotation: 0,
      wall: "left",
    },
    { id: 11, name: "TV", color: "#1a1a1a", position: [0, 1.5, 2.2], size: [1.8, 1, 0.1], rotation: Math.PI },
  ])

  // Texture cache
  const textureCache = useRef<{ [key: string]: THREE.Texture }>({})

  // Create a cached texture or return from cache
  const createCachedTexture = useCallback((key: string, creator: () => THREE.Texture): THREE.Texture => {
    if (!textureCache.current[key]) {
      textureCache.current[key] = creator()
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
        }
        const texture = new THREE.CanvasTexture(canvas)
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        return texture
      })
    },
    [createCachedTexture],
  )

  // Create a wood texture
  const createWoodTexture = useCallback(() => {
    return createCachedTexture("wood", () => {
      const canvas = document.createElement("canvas")
      canvas.width = 1024 // Increased resolution
      canvas.height = 1024 // Increased resolution
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
      }
      const texture = new THREE.CanvasTexture(canvas)
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      return texture
    })
  }, [createCachedTexture])

  // Create a fabric texture
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
        }
        const texture = new THREE.CanvasTexture(canvas)
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        return texture
      })
    },
    [createCachedTexture],
  )

  // Create a marble texture
  const createMarbleTexture = useCallback(() => {
    return createCachedTexture("marble", () => {
      const canvas = document.createElement("canvas")
      canvas.width = 1024 // Increased resolution
      canvas.height = 1024 // Increased resolution
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
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      return texture
    })
  }, [createCachedTexture])

  // Create a TV content texture
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
      }

      const texture = new THREE.CanvasTexture(canvas)
      return texture
    })
  }, [createCachedTexture])

  // Create an enhanced splatter painting texture
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

  // Create a carpet texture
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
        }

        const texture = new THREE.CanvasTexture(canvas)
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(4, 4)
        return texture
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

  // Create a sofa with detailed cushions and pillows
  const createSofa = useCallback(
    (group: THREE.Group, size: number[], color: string) => {
      // Base frame
      const frameGeometry = new THREE.BoxGeometry(size[0], size[1] * 0.5, size[2])
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: darkenColor(color, 10),
        roughness: 0.7,
        map: createFabricTexture(darkenColor(color, 10)),
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
        map: createFabricTexture(color),
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
        map: createFabricTexture(color),
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
        map: createFabricTexture(color),
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
          map: createFabricTexture(color),
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
          map: createFabricTexture(color),
        }),
      )
      rightPad.position.set(size[0] * 0.425, size[1] * 0.35, 0)
      rightPad.castShadow = true
      rightPad.receiveShadow = true
      group.add(rightPad)

      // Decorative throw pillows
      const pillowPositions = [
        [-size[0] * 0.3, size[1] * 0.4, -size[2] * 0.25],
        [size[0] * 0.3, size[1] * 0.4, -size[2] * 0.25],
      ]

      pillowPositions.forEach((pos, idx) => {
        const pillowGeometry = new THREE.BoxGeometry(size[0] * 0.2, size[1] * 0.2, size[1] * 0.2, 8, 8, 8)
        const pillowMaterial = new THREE.MeshStandardMaterial({
          color: idx === 0 ? "#b77b59" : "#b8cde5", // Orange and blue pillows
          roughness: 1.0,
          map: createFabricTexture(idx === 0 ? "#b77b59" : "#b8cde5"),
        })

        const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial)
        pillow.position.set(...pos)
        pillow.rotation.set(Math.random() * 0.2 - 0.1, Math.random() * 0.4 - 0.2, Math.random() * 0.2 - 0.1)
        pillow.castShadow = true
        pillow.receiveShadow = true
        group.add(pillow)
      })

      // Legs
      const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, size[1] * 0.3, 8)
      const legMaterial = new THREE.MeshStandardMaterial({
        color: "#412917",
        roughness: 0.5,
        metalness: 0.3,
        map: createWoodTexture(),
      })

      const legPositions = [
        [-size[0] / 2 + 0.1, -size[1] * 0.45, size[2] / 2 - 0.1],
        [size[0] / 2 - 0.1, -size[1] * 0.45, size[2] / 2 - 0.1],
        [-size[0] / 2 + 0.1, -size[1] * 0.45, -size[2] / 2 + 0.1],
        [size[0] / 2 - 0.1, -size[1] * 0.45, -size[2] / 2 + 0.1],
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

      // Add some books for decoration
      const bookColors = ["#854442", "#2a623d", "#3a4e7a", "#76323f", "#c09f80"]
      const bookPositions = [
        [-size[0] * 0.3, -size[1] * 0.3, 0],
        [0, -size[1] * 0.3, 0],
        [size[0] * 0.3, -size[1] * 0.3, 0],
        [-size[0] * 0.2, -size[1] * 0.1, 0],
        [size[0] * 0.2, -size[1] * 0.1, 0],
        [0, size[1] * 0.1, 0],
        [-size[0] * 0.25, size[1] * 0.3, 0],
      ]

      bookPositions.forEach((pos, idx) => {
        const bookWidth = 0.15 + Math.random() * 0.1
        const bookHeight = 0.2 + Math.random() * 0.1
        const bookDepth = 0.1 + Math.random() * 0.1

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
        emissiveIntensity: 0.5,
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
      })
      const content = new THREE.Mesh(contentGeometry, contentMaterial)
      content.position.z = size[2] * 0.46
      group.add(content)
    },
    [createTVContentTexture],
  )

  // Create furniture based on type
  const createFurniture = useCallback(
    (item: any) => {
      const { name, size, color } = item
      const group = new THREE.Group()

      switch (name) {
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
        case "Splatter Painting":
          createSplatterPainting(group, size, color, item.wall || "left")
          break
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

  // Create a rotation control
  const createRotationControl = useCallback((object: THREE.Group) => {
    if (!object) return null

    const rotatorGroup = new THREE.Group()

    // Get the size of the object from userData
    const size = object.userData.size || [1, 1, 1]
    const radius = Math.max(size[0], size[2]) * 0.7

    // Create a circular track
    const trackGeometry = new THREE.TorusGeometry(radius, 0.03, 8, 32)
    const trackMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5,
    })
    const track = new THREE.Mesh(trackGeometry, trackMaterial)
    track.rotation.x = Math.PI / 2
    track.position.y = 0.05
    rotatorGroup.add(track)

    // Create a handle
    const handleGeometry = new THREE.SphereGeometry(0.08, 8, 8)
    const handleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const handle = new THREE.Mesh(handleGeometry, handleMaterial)
    handle.position.set(radius, 0.05, 0)
    rotatorGroup.add(handle)

    // Position the rotator at the object's position
    rotatorGroup.position.copy(object.position)
    rotatorGroup.position.y = 0.05

    return rotatorGroup
  }, [])

  // Throttled mouse move handler for better performance
  const throttledMouseMove = useCallback(
    throttle((event: MouseEvent) => {
      if (!rendererRef.current || !cameraRef.current) return

      const rect = rendererRef.current.domElement.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      if (isDraggingRef.current && selectedObjectRef.current && editMode) {
        if (isRotatingRef.current) {
          // Rotation mode - using the rotation control
          raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)

          // Calculate angle from center of object to mouse position
          const planeIntersects = raycasterRef.current.intersectObject(planeRef.current!)
          if (planeIntersects.length > 0) {
            const point = planeIntersects[0].point
            const center = selectedObjectRef.current.position.clone()

            // Calculate angle
            const angle = Math.atan2(point.x - center.x, point.z - center.z)

            // Apply rotation
            selectedObjectRef.current.rotation.y = angle

            // Update outline and rotator
            if (outlineRef.current) {
              outlineRef.current.rotation.y = angle
            }

            if (rotatorRef.current) {
              rotatorRef.current.rotation.y = angle
            }

            // Update furniture list
            const objectId = selectedObjectRef.current.userData.id
            setFurniture((prev) =>
              prev.map((item) => {
                if (item.id === objectId) {
                  return {
                    ...item,
                    rotation: angle,
                  }
                }
                return item
              }),
            )
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
            if (item.name === "Splatter Painting") {
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

            // Update position
            selectedObjectRef.current.position.x = newPosition.x
            selectedObjectRef.current.position.z = newPosition.z

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
            } else {
              // Update furniture list state
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
                      wall: selectedObjectRef.current!.userData.wall,
                    }
                  }
                  return item
                }),
              )
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
          }
        }
      }
    }, 16), // Throttle to ~60fps
    [editMode, furniture],
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

    // Create scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#f0f0f0")
    sceneRef.current = scene

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
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

        // Check if clicking on rotation control
        if (rotatorRef.current) {
          const rotatorIntersects = raycasterRef.current.intersectObject(rotatorRef.current, true)
          if (rotatorIntersects.length > 0) {
            isRotatingRef.current = true
            isDraggingRef.current = true
            document.body.style.cursor = "grabbing"
            return
          }
        }

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

            // Create rotation control
            const rotator = createRotationControl(selectedObject)
            if (rotator) {
              scene.add(rotator)
              rotatorRef.current = rotator
            }

            // Setup for dragging
            isDraggingRef.current = true
            selectedObjectRef.current = selectedObject
            isRotatingRef.current = false

            // Find intersection with the drag plane
            const planeIntersects = raycasterRef.current.intersectObject(dragPlane)
            if (planeIntersects.length > 0) {
              dragOffsetRef.current.copy(planeIntersects[0].point).sub(selectedObject.position)
              dragOffsetRef.current.y = 0 // Keep y-position unchanged
            }

            // Hide instructions after first interaction
            setInstructions(false)
          }
        } else {
          // Clicked on empty space
          setSelectedItem(null)
          selectedObjectRef.current = null

          // Remove outline
          if (outlineRef.current) {
            scene.remove(outlineRef.current)
            outlineRef.current = null
          }

          // Remove rotator
          if (rotatorRef.current) {
            scene.remove(rotatorRef.current)
            rotatorRef.current = null
          }
        }
      }
    }

    const onMouseUp = () => {
      isDraggingRef.current = false
      isRotatingRef.current = false
      document.body.style.cursor = "default"
    }

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      // Toggle edit mode with 'E' key
      if (event.key.toLowerCase() === "e") {
        setEditMode((prev) => !prev)

        // Clear selection when exiting edit mode
        if (editMode) {
          setSelectedItem(null)
          selectedObjectRef.current = null

          if (outlineRef.current) {
            scene.remove(outlineRef.current)
            outlineRef.current = null
          }

          if (rotatorRef.current) {
            scene.remove(rotatorRef.current)
            rotatorRef.current = null
          }
        }
      }

      // Toggle FPS counter with 'F' key
      if (event.key.toLowerCase() === "f") {
        showFpsRef.current = !showFpsRef.current
        if (fpsCounterRef.current) {
          fpsCounterRef.current.style.display = showFpsRef.current ? "block" : "none"
        }
      }
    }

    // Add event listeners
    renderer.domElement.addEventListener("mousedown", onMouseDown)
    renderer.domElement.addEventListener("mousemove", throttledMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    renderer.domElement.addEventListener("contextmenu", onContextMenu)
    window.addEventListener("keydown", onKeyDown)

    // Animation loop with performance optimization
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)

      // Only render when needed
      renderer.render(scene, camera)

      // Update FPS counter
      updateFPS()
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
      renderer.domElement.removeEventListener("mousemove", throttledMouseMove)
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
  ])

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-800 text-white p-2 flex justify-between items-center">
        <h2 className="text-lg font-bold">Cozy Living Room Designer</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-3 py-1 rounded ${
              editMode ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
            } transition-colors`}
          >
            {editMode ? "Exit Edit Mode" : "Enter Edit Mode"}
          </button>
          <div className="text-xs flex flex-col items-end">
            <p>Click to select and drag furniture. Use the green circle to rotate.</p>
            <p>Press 'E' to toggle edit mode.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0" ref={mountRef}></div>

        {/* FPS Counter */}
        <div
          ref={fpsCounterRef}
          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm"
          style={{ display: "none" }}
        >
          0 FPS
        </div>

        {instructions && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg max-w-md text-center">
              <h3 className="text-xl font-bold mb-4">Welcome to the Living Room Designer</h3>
              <ul className="text-left space-y-2 mb-4">
                <li>• Click and drag to move furniture</li>
                <li>• Use the green circle around selected items to rotate them</li>
                <li>• Press 'E' to toggle edit mode</li>
                <li>• Press 'F' to show/hide FPS counter</li>
                <li>• The splatter painting will snap to walls automatically</li>
                <li>• Furniture will not overlap with other pieces</li>
              </ul>
            </div>
          </div>
        )}

        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-700">Loading 3D Room...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
