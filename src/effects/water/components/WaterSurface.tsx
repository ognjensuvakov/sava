import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import waterVertexShader from '../shaders/water.vert?raw'
import waterFragmentShader from '../shaders/water.frag?raw'

const WaterMaterial = {
    uniforms: {
        uSimulation: { value: null },
        uColor: { value: new THREE.Color('#00aaff') },
        uHighlight: { value: new THREE.Color('#ffffff') }, // New
        uOpacity: { value: 0.5 }, // New
        uLightPos: { value: new THREE.Vector3(10, 10, 10) }
    },
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    transparent: true,
    side: THREE.DoubleSide
}

export type WaterSurfaceProps = {
    outputRef: React.MutableRefObject<THREE.Texture | null>
    width: number
    height: number
    color: string
    highlight: string
    opacity: number
}

export function WaterSurface({ outputRef, width, height, color, highlight, opacity }: WaterSurfaceProps) {
    const materialRef = useRef<THREE.ShaderMaterial>(null)

    useFrame(() => {
        if (materialRef.current) {
            if (outputRef.current) {
                materialRef.current.uniforms.uSimulation.value = outputRef.current
            }
            // Update visuals
            materialRef.current.uniforms.uColor.value.set(color)
            materialRef.current.uniforms.uHighlight.value.set(highlight)
            materialRef.current.uniforms.uOpacity.value = opacity
        }
    })

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.75, 0, 0]}>
            <planeGeometry args={[width, height, Math.floor(width * 64), Math.floor(height * 64)]} />
            <shaderMaterial
                ref={materialRef}
                args={[WaterMaterial]}
            />
        </mesh>
    )
}
