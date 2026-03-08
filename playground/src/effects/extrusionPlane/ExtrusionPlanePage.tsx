import { useRef } from 'react'
import * as THREE from 'three'
import { useControls } from 'leva'
import { PlaneNeedles } from './components/PlaneNeedles'
import { OrbitControls } from '@react-three/drei'
import { TrailSimulation } from '../extrusion/components/TrailSimulation'

export function ExtrusionPlanePage() {
    const mouseRef = useRef(new THREE.Vector3(0, 0, 0))
    const trailOutputRef = useRef<THREE.Texture | null>(null)

    const {
        planeSize,
        detail,
        scale,
        spikeMax,
        thickness,
        radius,
        motionFade
    } = useControls('Plane Extrusion Settings', {
        planeSize: { value: 20.0, min: 5.0, max: 50.0 }, // Size of the plane
        detail: { value: 200, min: 20, max: 400, step: 1 }, // Resolution
        scale: { value: 3.5, min: 0.1, max: 10.0 }, // Base height multiplier
        spikeMax: { value: 3.0, min: 0.5, max: 15.0 }, // Spikiness Max
        thickness: { value: 0.03, min: 0.005, max: 0.2, step: 0.001 },
        radius: { value: 1.5, min: 0.1, max: 10.0 }, // interaction radius
        motionFade: { value: 0.96, min: 0.8, max: 0.999 }
    })

    // Gradient Palette Settings
    const { colorA, colorB, colorC, colorD } = useControls('Needle Palette', {
        colorA: [0.5, 0.5, 0.5],
        colorB: [0.5, 0.5, 0.5],
        colorC: [1.0, 1.0, 1.0],
        colorD: [0.00, 0.33, 0.67], // Default to blue hues mostly
    })

    const { showBase, baseColor, metalness, roughness } = useControls('Base Plane', {
        showBase: true,
        baseColor: '#1d1d1d',
        metalness: { value: 0.8, min: 0, max: 1 },
        roughness: { value: 0.2, min: 0, max: 1 }
    })

    const handlePointerMove = (e: any) => {
        if (e.point) {
            // Map world point to UV [0,1] for the simulation buffer
            // Grid is 20x20 centered at 0.
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
                options={{ fade: motionFade, size: radius / 20.0 }}
                mouse={mouseRef}
                outputRef={trailOutputRef}
            />

            {/* The base plane that captures mouse events and provides solid floor */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
            >
                <planeGeometry args={[planeSize, planeSize]} />
                {showBase ? (
                    <meshStandardMaterial
                        color={baseColor}
                        metalness={metalness}
                        roughness={roughness}
                        side={THREE.DoubleSide}
                    />
                ) : (
                    <meshBasicMaterial transparent opacity={0.0} depthWrite={false} color="red" />
                )}
            </mesh>

            <PlaneNeedles
                trailRef={trailOutputRef}
                planeSize={planeSize}
                detail={detail}
                scale={scale}
                thickness={thickness}
                spikeMax={spikeMax}
                colorA={colorA}
                colorB={colorB}
                colorC={colorC}
                colorD={colorD}
            />

            <OrbitControls makeDefault />
        </>
    )
}
