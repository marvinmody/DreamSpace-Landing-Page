"use client"

import { useState, useRef, useEffect } from "react"
import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html, useTexture, Text, Float } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw, Edit3, Check, Move } from "lucide-react"

// Furniture item type
interface FurnitureItem {
  id: string
  name: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  color: string
  type: "sofa" | "table" | "chair" | "lamp" | "plant" | "shelf" | "rug" | "tv" | "art"
  geometry: string
  movable: boolean
}

// Room component that handles the 3D scene
const Room = ({ editMode, setSelectedItem, selectedItem }) => {
  const { camera } = useThree()
  const [furniture, setFurniture] = useState<FurnitureItem[]>([])
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const floorRef = useRef<THREE.Mesh>(null)
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const dragOffset = useRef(new THREE.Vector3())
  const isDragging = useRef(false)

  // Load textures
  const woodTexture = useTexture("/textures/wood-floor.jpg")
  const wallTexture = useTexture("/textures/wall.jpg")
  const rugTexture = useTexture("/textures/patterned-rug.jpg")

  // Configure textures
  useEffect(() => {
    ;[woodTexture, wallTexture, rugTexture].forEach((texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(4, 4)
      texture.anisotropy = 16
    })
  }, [woodTexture, wallTexture, rugTexture])

  // Initialize furniture
  useEffect(() => {
    setFurniture([
      {
        id: "sofa",
        name: "Modern Sofa",
        position: [0, 0.3, 2],
        rotation: [0, Math.PI, 0],
        scale: 1,
        color: "#4a7ca8",
        type: "sofa",
        geometry: "box",
        movable: true,
      },
      {
        id: "coffee-table",
        name: "Coffee Table",
        position: [0, 0.2, 0],
        rotation: [0, 0, 0],
        scale: 1,
        color: "#8d6e63",
        type: "table",
        geometry: "box",
        movable: true,
      },
      {
        id: "tv-stand",
        name: "TV Stand",
        position: [0, 0.4, -2.5],
        rotation: [0, 0, 0],
        scale: 1,
        color: "#455a64",
        type: "tv",
        geometry: "box",
        movable: true,
      },
      {
        id: "plant",
        name: "Potted Plant",
        position: [-2, 0.5, 1.5],
        rotation: [0, 0, 0],
        scale: 1,
        color: "#388e3c",
        type: "plant",
        geometry: "sphere",
        movable: true,
      },
      {
        id: "bookshelf",
        name: "Bookshelf",
        position: [-2.5, 0.75, -1.5],
        rotation: [0, 0, 0],
        scale: 1,
        color: "#5d4037",
        type: "shelf",
        geometry: "box",
        movable: true,
      },
      {
        id: "lamp",
        name: "Floor Lamp",
        position: [2.5, 0.8, 1.5],
        rotation: [0, 0, 0],
        scale: 1,
        color: "#bdbdbd",
        type: "lamp",
        geometry: "cylinder",
        movable: true,
      },
      {
        id: "armchair",
        name: "Armchair",
        position: [2, 0.3, -1],
        rotation: [0, -Math.PI / 4, 0],
        scale: 0.8,
        color: "#78909c",
        type: "chair",
        geometry: "box",
        movable: true,
      },
      {
        id: "rug",
        name: "Area Rug",
        position: [0, 0.01, 0],
        rotation: [0, 0, 0],
        scale: 1,
        color: "#f5f5f5",
        type: "rug",
        geometry: "plane",
        movable: true,
      },
    ])
  }, [])

  // Handle pointer down for selecting and dragging furniture
  const handlePointerDown = (event, item) => {
    if (!editMode) return

    event.stopPropagation()
    setSelectedItem(item.id)

    // Calculate drag offset
    const intersection = new THREE.Vector3()
    raycaster.current.setFromCamera(mouse.current, camera)

    if (raycaster.current.ray.intersectPlane(dragPlane.current, intersection)) {
      dragOffset.current.copy(intersection).sub(new THREE.Vector3(...item.position))
      isDragging.current = true
    }
  }

  // Handle pointer move for dragging furniture
  const handlePointerMove = (event) => {
    // Update mouse position
    const canvas = event.target
    const rect = canvas.getBoundingClientRect()
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // Handle dragging
    if (isDragging.current && editMode && selectedItem) {
      const intersection = new THREE.Vector3()
      raycaster.current.setFromCamera(mouse.current, camera)

      if (raycaster.current.ray.intersectPlane(dragPlane.current, intersection)) {
        // Calculate new position
        const newPosition = intersection.sub(dragOffset.current)

        // Update furniture position
        setFurniture((prev) =>
          prev.map((item) =>
            item.id === selectedItem
              ? {
                  ...item,
                  position: [
                    // Constrain to room boundaries
                    Math.max(-3, Math.min(3, newPosition.x)),
                    item.position[1],
                    Math.max(-3, Math.min(3, newPosition.z)),
                  ],
                }
              : item,
          ),
        )
      }
    }
  }

  // Handle pointer up to end dragging
  const handlePointerUp = () => {
    isDragging.current = false
  }

  // Handle pointer out to end dragging if cursor leaves canvas
  const handlePointerOut = () => {
    isDragging.current = false
  }

  // Set up event listeners
  useEffect(() => {
    const canvas = document.querySelector("canvas")
    if (canvas) {
      canvas.addEventListener("pointermove", handlePointerMove)
      canvas.addEventListener("pointerup", handlePointerUp)
      canvas.addEventListener("pointerout", handlePointerOut)

      return () => {
        canvas.removeEventListener("pointermove", handlePointerMove)
        canvas.removeEventListener("pointerup", handlePointerUp)
        canvas.removeEventListener("pointerout", handlePointerOut)
      }
    }
  }, [editMode, selectedItem])

  // Render the room
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <hemisphereLight args={["#ffeeff", "#080820", 0.5]} />

      {/* Floor */}
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial map={woodTexture} roughness={0.8} />
      </mesh>

      {/* Walls */}
      <group>
        {/* Back wall */}
        <mesh position={[0, 1.5, -4]} receiveShadow>
          <boxGeometry args={[8, 3, 0.1]} />
          <meshStandardMaterial map={wallTexture} color="#f0f0f0" roughness={0.9} />
        </mesh>

        {/* Left wall */}
        <mesh position={[-4, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <boxGeometry args={[8, 3, 0.1]} />
          <meshStandardMaterial map={wallTexture} color="#e8e8e8" roughness={0.9} />
        </mesh>
      </group>

      {/* Area rug */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 4]} />
        <meshStandardMaterial map={rugTexture} roughness={0.8} transparent opacity={0.9} />
      </mesh>

      {/* Furniture */}
      {furniture.map((item) => (
        <FurnitureItem
          key={item.id}
          item={item}
          isSelected={selectedItem === item.id}
          isHovered={hoveredItem === item.id}
          editMode={editMode}
          onPointerDown={(e) => handlePointerDown(e, item)}
          onPointerOver={() => setHoveredItem(item.id)}
          onPointerOut={() => setHoveredItem(null)}
        />
      ))}

      {/* Room title */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Text
          position={[0, 2.5, 0]}
          color="#1e88e5"
          fontSize={0.3}
          maxWidth={4}
          lineHeight={1.2}
          letterSpacing={0.02}
          textAlign="center"
          font="/fonts/Inter-Bold.ttf"
        >
          DreamSpace Room Editor
          <meshBasicMaterial color="#1e88e5" toneMapped={false} />
        </Text>
      </Float>

      {/* Edit mode indicator */}
      {editMode && (
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-blue-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-blue-600 font-medium border border-blue-300 shadow-lg">
            Edit Mode Active
          </div>
        </Html>
      )}
    </>
  )
}

// Furniture item component
const FurnitureItem = ({ item, isSelected, isHovered, editMode, onPointerDown, onPointerOver, onPointerOut }) => {
  const meshRef = useRef<THREE.Mesh>(null)

  // Apply visual effects based on state
  useFrame(() => {
    if (!meshRef.current) return

    // Hover effect - slight elevation
    if (isHovered && editMode) {
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, item.position[1] + 0.1, 0.1)
    } else if (isSelected && editMode) {
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, item.position[1] + 0.15, 0.1)
    } else {
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, item.position[1], 0.1)
    }
  })

  // Render different geometries based on furniture type
  const renderGeometry = () => {
    switch (item.geometry) {
      case "box":
        // Adjust dimensions based on furniture type
        const dimensions = getFurnitureDimensions(item.type)
        return <boxGeometry args={dimensions} />
      case "cylinder":
        return <cylinderGeometry args={[0.2, 0.2, 1.6, 16]} />
      case "sphere":
        return <sphereGeometry args={[0.5, 16, 16]} />
      case "plane":
        return <planeGeometry args={[4, 3]} />
      default:
        return <boxGeometry args={[1, 0.5, 1]} />
    }
  }

  // Get dimensions based on furniture type
  const getFurnitureDimensions = (type) => {
    switch (type) {
      case "sofa":
        return [2.2, 0.6, 0.9]
      case "table":
        return [1.2, 0.4, 0.8]
      case "chair":
        return [0.8, 0.8, 0.8]
      case "tv":
        return [2, 0.8, 0.4]
      case "shelf":
        return [0.8, 1.5, 0.4]
      default:
        return [1, 0.5, 1]
    }
  }

  // Render furniture with appropriate material
  return (
    <group position={[item.position[0], 0, item.position[2]]} rotation={item.rotation}>
      <mesh
        ref={meshRef}
        position={[0, item.position[1], 0]}
        scale={item.scale}
        castShadow
        receiveShadow
        onPointerDown={onPointerDown}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        {renderGeometry()}
        <meshPhysicalMaterial
          color={item.color}
          roughness={0.7}
          metalness={0.1}
          clearcoat={0.2}
          clearcoatRoughness={0.2}
          emissive={isSelected || isHovered ? item.color : "#000000"}
          emissiveIntensity={isSelected ? 0.3 : isHovered ? 0.1 : 0}
        />
      </mesh>

      {/* Item label on hover */}
      {(isHovered || isSelected) && (
        <Html position={[0, item.position[1] + 0.8, 0]} center>
          <div className="bg-white px-2 py-1 rounded text-xs shadow-md pointer-events-none">
            {item.name}
            {editMode && (
              <div className="text-blue-500 text-[10px]">{isSelected ? "• Selected" : "• Click to select"}</div>
            )}
          </div>
        </Html>
      )}

      {/* Selection indicator */}
      {isSelected && editMode && (
        <mesh position={[0, item.position[1] - 0.1, 0]}>
          <ringGeometry args={[0.6, 0.65, 32]} />
          <meshBasicMaterial color="#1e88e5" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  )
}

// Controls component
const Controls = ({ editMode, setEditMode, resetView }) => {
  const { camera } = useThree()
  const controlsRef = useRef()
  const isDragging = useRef(false)

  // Reset camera position
  useEffect(() => {
    if (resetView) {
      camera.position.set(5, 5, 5)
      camera.lookAt(0, 0, 0)
    }
  }, [resetView, camera])

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={0.5}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.5}
      minDistance={4}
      maxDistance={12}
      enablePan={editMode}
      enabled={!editMode || !isDragging.current}
    />
  )
}

// Main component
export default function EnhancedIsometricRoom() {
  const [editMode, setEditMode] = useState(false)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [resetView, setResetView] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5))
  }

  // Handle reset view
  const handleResetView = () => {
    setResetView(true)
    setZoomLevel(1)
    setTimeout(() => setResetView(false), 100)
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode((prev) => !prev)
    if (editMode) {
      setSelectedItem(null)
    }
  }

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-xl">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [5, 5, 5], fov: 50, near: 0.1, far: 1000 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#f8f9fa"]} />
        <fog attach="fog" args={["#f8f9fa", 8, 20]} />

        <Room editMode={editMode} setSelectedItem={setSelectedItem} selectedItem={selectedItem} />

        <Controls editMode={editMode} setEditMode={setEditMode} resetView={resetView} />
      </Canvas>

      {/* UI Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
        <Button
          variant="default"
          size="sm"
          onClick={toggleEditMode}
          className={`${
            editMode
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-white text-blue-500 hover:bg-gray-100 border border-blue-200"
          } transition-all duration-200`}
        >
          {editMode ? <Check className="h-4 w-4 mr-1" /> : <Edit3 className="h-4 w-4 mr-1" />}
          {editMode ? "Done" : "Edit Room"}
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={handleZoomIn}
          className="bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition-all duration-200"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={handleZoomOut}
          className="bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition-all duration-200"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleResetView}
          className="bg-white hover:bg-gray-100 transition-all duration-200"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 text-gray-700 shadow-lg border border-gray-200 z-10 max-w-xs">
        <div className="font-medium text-sm flex items-center">
          <Move className="h-4 w-4 mr-1 text-blue-500" />
          Room Controls
        </div>
        <div className="text-xs mt-1">• Click and drag to rotate view</div>
        <div className="text-xs mt-1">• Use buttons to zoom in/out</div>
        {editMode ? (
          <>
            <div className="text-xs mt-1 text-blue-600 font-medium">Edit Mode Active:</div>
            <div className="text-xs mt-1">• Click on furniture to select</div>
            <div className="text-xs mt-1">• Drag selected furniture to move it</div>
          </>
        ) : (
          <div className="text-xs mt-1">• Click "Edit Room" to modify layout</div>
        )}
      </div>

      {/* Edit mode indicator */}
      {editMode && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 animate-pulse"></div>}
    </div>
  )
}
