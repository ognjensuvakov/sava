import { useRef, useState } from 'react'
import * as THREE from 'three'
import { useControls } from 'leva'
import { CubeNeedles } from './components/CubeNeedles'
import { OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export function ExtrusionCubePage() {
    const [hovered, setHovered] = useState(false)
    const groupRef = useRef<THREE.Group>(null)

    const {
        cubeSize,
        detail,
        scale,
        spikeMax,
        thickness,
        showBase,
        idleColor
    } = useControls('Cube Extrusion Settings', {
        cubeSize: { value: 6.0, min: 2.0, max: 20.0 },
        detail: { value: 40, min: 10, max: 100, step: 1 }, // Note: (detail+1)^3 vertices, careful not to blow up! 40 => 41^3 = ~68k needles
        scale: { value: 3.5, min: 0.1, max: 10.0 },
        spikeMax: { value: 3.0, min: 0.5, max: 15.0 },
        thickness: { value: 0.05, min: 0.005, max: 0.2, step: 0.001 },
        showBase: true,
        idleColor: '#111111'
    })

    // Gradient Palette Settings
    const { colorA, colorB, colorC, colorD } = useControls('Needle Palette', {
        colorA: [0.5, 0.5, 0.5],
        colorB: [0.5, 0.5, 0.5],
        colorC: [1.0, 1.0, 1.0],
        colorD: [0.00, 0.33, 0.67],
    })

    useFrame((_, delta) => {
        if (groupRef.current) {
            // Slight continuous rotation
            groupRef.current.rotation.y += delta * 0.1
            groupRef.current.rotation.x += delta * 0.05

            // If hovered, speed up the spin for extra juice
            if (hovered) {
                groupRef.current.rotation.y += delta * 0.6
                groupRef.current.rotation.x += delta * 0.2
            }
        }
    })

    return (
        <>
            <group ref={groupRef}>
                {/* Invisible trigger mesh wrapping the whole cube tightly */}
                <mesh
                    onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
                    onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
                >
                    <boxGeometry args={[cubeSize + 0.5, cubeSize + 0.5, cubeSize + 0.5]} />
                    <meshBasicMaterial transparent opacity={0.0} depthWrite={false} color="red" />
                </mesh>

                {/* Solid dark base cube so you don't see straight through everything */}
                {showBase && (
                    <mesh>
                        <boxGeometry args={[cubeSize * 0.99, cubeSize * 0.99, cubeSize * 0.99]} />
                        <meshBasicMaterial color={idleColor} transparent opacity={hovered ? 1.0 : 0.0} />
                    </mesh>
                )}

                <CubeNeedles
                    hoverState={hovered ? 1.0 : 0.0}
                    cubeSize={cubeSize}
                    detail={detail}
                    scale={scale}
                    thickness={thickness}
                    spikeMax={spikeMax}
                    colorA={colorA}
                    colorB={colorB}
                    colorC={colorC}
                    colorD={colorD}
                    idleColor={idleColor}
                />
            </group>

            <OrbitControls makeDefault />
        </>
    )
}
