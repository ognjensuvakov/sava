import { useRef } from 'react'
import * as THREE from 'three'
import { useControls } from 'leva' // Import folder
import { WaterSimulation } from './WaterSimulation'
import { WaterSurface } from './WaterSurface'

export function Playground() {
    const mouseRef = useRef(new THREE.Vector3(0, 0, 0))
    const outputRef = useRef<THREE.Texture | null>(null)

    // Leva useControls does not return a flattened object automatically when using simple object nesting without 'folder' helper sometimes, 
    // or it behaves differently in TS. 
    // Safer to use separate useControls calls or the folder helper.

    // Let's use two separate useControls hooks for simplicity and type safety.
    const simulationProps = useControls('Simulation', {
        delta: { value: 1.0, min: 0.1, max: 2.0 },
        damping: { value: 0.002, min: 0.0, max: 0.01 },
        pressureDamping: { value: 0.98, min: 0.9, max: 0.999 },
        width: { value: 10, min: 1, max: 20, step: 0.1 },
        height: { value: 5, min: 1, max: 20, step: 0.1 },
    })

    const visualsProps = useControls('Visuals', {
        color: '#00aaff',
        highlight: '#ffffff',
        opacity: { value: 0.5, min: 0.0, max: 1.0 },
    })

    // Extract values
    const { delta, damping, pressureDamping, width, height } = simulationProps
    const { color, highlight, opacity } = visualsProps

    const handlePointerMove = (e: any) => {
        if (e.uv) {
            mouseRef.current.x = e.uv.x
            mouseRef.current.y = e.uv.y
        }
    }

    const handlePointerDown = (e: any) => {
        mouseRef.current.z = 1
        handlePointerMove(e)
    }

    const handlePointerUp = () => {
        mouseRef.current.z = 0
    }

    return (
        <>
            <WaterSimulation
                options={{ delta, damping, pressureDamping }}
                mouse={mouseRef}
                outputRef={outputRef}
                width={width}
                height={height}
            />

            <group>
                <mesh position={[0, -1, 0]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="orange" />
                </mesh>

                <mesh position={[1.5, -0.5, 1.5]}>
                    <sphereGeometry args={[0.5]} />
                    <meshStandardMaterial color="hotpink" />
                </mesh>

                <group
                    onPointerMove={handlePointerMove}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                >
                    <WaterSurface
                        outputRef={outputRef}
                        width={width}
                        height={height}
                        color={color}
                        highlight={highlight}
                        opacity={opacity}
                    />
                </group>
            </group>
        </>
    )
}
