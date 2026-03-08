import { useRef } from 'react'
import * as THREE from 'three'
import { useControls } from 'leva'
import { TrailSimulation } from '../extrusion/components/TrailSimulation'
import { GridMapV2 } from './components/GridMapV2'

export function ExtrusionV2Page() {
    const mouseRef = useRef(new THREE.Vector3(0, 0, 0))
    const trailOutputRef = useRef<THREE.Texture | null>(null)

    const { fade, size, scale, thickness } = useControls('Extrusion V2 Settings', {
        fade: { value: 0.96, min: 0.8, max: 0.999 },
        size: { value: 0.04, min: 0.01, max: 0.2 },
        scale: { value: 1.5, min: 0.1, max: 5.0 },
        thickness: { value: 0.015, min: 0.005, max: 0.05, step: 0.001 },
    })

    // Gradient Palette Settings
    const { colorA, colorB, colorC, colorD } = useControls('Needle Palette', {
        colorA: [0.5, 0.5, 0.5],
        colorB: [0.5, 0.5, 0.5],
        colorC: [1.0, 1.0, 1.0],
        colorD: [0.00, 0.33, 0.67], // Default to blue hues mostly
    })

    const handlePointerMove = (e: any) => {
        if (e.point) {
            // Map world point to UV [0,1] for the simulation buffer
            const x = (e.point.x + 10) / 20
            const z = (e.point.z + 10) / 20

            mouseRef.current.x = x
            mouseRef.current.y = z
            mouseRef.current.z = 1 // active
        }
    }

    const handlePointerLeave = () => {
        mouseRef.current.z = 0
    }

    return (
        <>
            <TrailSimulation
                options={{ fade, size }}
                mouse={mouseRef}
                outputRef={trailOutputRef}
            />

            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0, 0]}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                visible={false}
            >
                <planeGeometry args={[20, 20]} />
                <meshBasicMaterial color="red" visible={false} />
            </mesh>

            <GridMapV2
                trailRef={trailOutputRef}
                scale={scale}
                thickness={thickness}
                colorA={colorA}
                colorB={colorB}
                colorC={colorC}
                colorD={colorD}
            />
        </>
    )
}
