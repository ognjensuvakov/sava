import { useRef } from 'react'
import * as THREE from 'three'
import { useControls } from 'leva'
import { useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { WaterSimulation } from './components/WaterSimulation' // Updated path
import { WaterSurface } from './components/WaterSurface' // Updated path

type InteractiveCubeProps = {
    target: React.MutableRefObject<THREE.Vector3>
    size: number
    color: string
    opacity: number
    metalness: number
    roughness: number
    clearcoat: number
    clearcoatRoughness: number
    envMapIntensity: number
}

function InteractiveCube({ target, size, color, opacity, metalness, roughness, clearcoat, clearcoatRoughness, envMapIntensity }: InteractiveCubeProps) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.lookAt(target.current)
        }
    })

    return (
        <mesh ref={meshRef} position={[2, -1, 0]} scale={[size, size, size]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshPhysicalMaterial
                color={color}
                transparent={opacity < 1}
                opacity={opacity}
                metalness={metalness}
                roughness={roughness}
                clearcoat={clearcoat}
                clearcoatRoughness={clearcoatRoughness}
                envMapIntensity={envMapIntensity}
            />
        </mesh>
    )
}

export function Playground() {
    const mouseRef = useRef(new THREE.Vector3(0, 0, 0)) // For shader: UV coord
    const mouseWorldRef = useRef(new THREE.Vector3(0, 0, 0)) // For cube: World position

    const outputRef = useRef<THREE.Texture | null>(null)

    const simulationProps = useControls('Simulation', {
        delta: { value: 1.0, min: 0.1, max: 2.0 },
        damping: { value: 0.002, min: 0.0, max: 0.01 },
        pressureDamping: { value: 0.98, min: 0.9, max: 0.999 },
        width: { value: 2.9, min: 1, max: 20, step: 0.1 },
        height: { value: 1.7, min: 1, max: 20, step: 0.1 },
    })

    const visualsProps = useControls('Visuals', {
        color: '#00aaff',
        highlight: '#ffffff',
        opacity: { value: 0.5, min: 0.0, max: 1.0 },
    })

    const cubeProps = useControls('Cube', {
        cubeColor: '#145FD8', // User requested blue
        cubeSize: { value: 1.0, min: 0.5, max: 3.0 },
        cubeOpacity: { value: 1.0, min: 0.0, max: 1.0 },
        cubeMetalness: { value: 0.5, min: 0.0, max: 1.0 },
        cubeRoughness: { value: 0.2, min: 0.0, max: 1.0 },
        cubeClearcoat: { value: 1.0, min: 0.0, max: 1.0 },
        cubeClearcoatRoughness: { value: 0.1, min: 0.0, max: 1.0 },
        cubeEnvMapIntensity: { value: 1.0, min: 0.0, max: 3.0 },
    })

    const floorProps = useControls('Floor', {
        floorColor: '#E3ECFA', // User requested light blue
        floorDepth: { value: 2.0, min: 1.0, max: 10.0 },
    })

    // Extract
    const { delta, damping, pressureDamping, width, height } = simulationProps
    const { color, highlight, opacity } = visualsProps
    const { cubeColor, cubeSize, cubeOpacity, cubeMetalness, cubeRoughness, cubeClearcoat, cubeClearcoatRoughness, cubeEnvMapIntensity } = cubeProps
    const { floorColor, floorDepth } = floorProps

    const handlePointerMove = (e: any) => {
        // e.uv is [0,1].
        if (e.uv) {
            mouseRef.current.x = e.uv.x
            mouseRef.current.y = e.uv.y
        }
        // e.point is Vector3 world position
        if (e.point) {
            mouseWorldRef.current.copy(e.point)
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
            {/* Environment for reflections */}
            <Environment preset="city" />

            <WaterSimulation
                options={{ delta, damping, pressureDamping }}
                mouse={mouseRef}
                outputRef={outputRef}
                width={width}
                height={height}
            />

            <group>
                {/* Interactive Cube */}
                <InteractiveCube
                    target={mouseWorldRef}
                    size={cubeSize}
                    color={cubeColor}
                    opacity={cubeOpacity}
                    metalness={cubeMetalness}
                    roughness={cubeRoughness}
                    clearcoat={cubeClearcoat}
                    clearcoatRoughness={cubeClearcoatRoughness}
                    envMapIntensity={cubeEnvMapIntensity}
                />

                {/* Floor */}
                <mesh position={[0, -floorDepth, 0]} rotation={[-Math.PI / 2, 0, 0]} >
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color={floorColor} />
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
