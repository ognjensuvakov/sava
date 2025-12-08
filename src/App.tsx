import { Canvas } from '@react-three/fiber'

import { Suspense } from 'react'
import { Leva } from 'leva'
import { Playground } from './components/Playground'

function App() {
  return (
    <>
      <Canvas camera={{ position: [0, 5, 0], fov: 45 }}>
        {/* <OrbitControls /> */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <Playground />
        </Suspense>
      </Canvas>
      <Leva collapsed={false} />
    </>
  )
}

export default App
