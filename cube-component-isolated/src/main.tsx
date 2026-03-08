import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import { StandaloneFaceCube } from './effects/extrusionFaceCube/StandaloneFaceCube'
import './index.css'

// Find the target container in the hosting page
const containerId = 'water-cube-container'
const container = document.getElementById(containerId)

if (!container) {
  console.warn(`[Water Cube] Could not find container with id="${containerId}". Make sure it exists in your Webflow/HTML.`)
} else {
  // Inject the canvas into the specific container
  createRoot(container).render(
    <StrictMode>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        gl={{ antialias: true, alpha: true }} // alpha true allows webflow background to show
      >
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <StandaloneFaceCube />
      </Canvas>
    </StrictMode>,
  )
}
