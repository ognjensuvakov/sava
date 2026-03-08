import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Leva, useControls } from 'leva'
import { Playground as WaterPage } from './effects/water/WaterPage'
import { GlitchPage } from './effects/glitch/GlitchPage'
import { ExtrusionPage } from './effects/extrusion/ExtrusionPage'
import { ExtrusionV2Page } from './effects/extrusionV2/ExtrusionV2Page'
import { ExtrusionObjectPage } from './effects/extrusionObject/ExtrusionObjectPage'
import { ExtrusionPlanePage } from './effects/extrusionPlane/ExtrusionPlanePage'
import { ExtrusionCubePage } from './effects/extrusionCube/ExtrusionCubePage'
import { ExtrusionFaceCubePage } from './effects/extrusionFaceCube/ExtrusionFaceCubePage'

// Simple Scene Wrapper to handle context-dependent logic if needed
function Scene({ page }: { page: string }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Suspense fallback={null}>
        {page === 'water' && <WaterPage />}
        {page === 'glitch' && <GlitchPage />}
        {page === 'extrusion' && <ExtrusionPage />}
        {page === 'extrusionV2' && <ExtrusionV2Page />}
        {page === 'extrusionObject' && <ExtrusionObjectPage />}
        {page === 'extrusionPlane' && <ExtrusionPlanePage />}
        {page === 'extrusionCube' && <ExtrusionCubePage />}
        {page === 'extrusionFaceCube' && <ExtrusionFaceCubePage />}
      </Suspense>
    </>
  )
}

function App() {
  const { page } = useControls('Navigation', {
    page: { options: ['water', 'glitch', 'extrusion', 'extrusionV2', 'extrusionObject', 'extrusionPlane', 'extrusionCube', 'extrusionFaceCube'] }
  })

  return (
    <>
      <Canvas camera={{ position: [0, 5, 0], fov: 45 }}>
        <Scene page={page} />
      </Canvas>
      <Leva collapsed={false} />
    </>
  )
}

export default App
