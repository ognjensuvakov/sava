import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import commonVertexShader from '../shaders/common.vert?raw'
import sortingFragmentShader from '../shaders/sorting.frag?raw'

const SortingMaterial = {
    uniforms: {
        uTrail: { value: null },
        uTime: { value: 0 },
        uThreshold: { value: 0.1 },
        uColorA: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
        uColorB: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
        uColorC: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        uColorD: { value: new THREE.Vector3(0.263, 0.416, 0.557) },
    },
    vertexShader: commonVertexShader,
    fragmentShader: sortingFragmentShader,
    transparent: true,
}

export type SortingPlaneProps = {
    trailRef: React.MutableRefObject<THREE.Texture | null>
    threshold: number
    colorA: [number, number, number]
    colorB: [number, number, number]
    colorC: [number, number, number]
    colorD: [number, number, number]
}

export function SortingPlane({ trailRef, threshold, colorA, colorB, colorC, colorD }: SortingPlaneProps) {
    const materialRef = useRef<THREE.ShaderMaterial>(null)
    const { viewport } = useThree()

    useFrame((state) => {
        if (materialRef.current) {
            if (trailRef.current) {
                materialRef.current.uniforms.uTrail.value = trailRef.current
            }
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
            materialRef.current.uniforms.uThreshold.value = threshold

            materialRef.current.uniforms.uColorA.value.set(...colorA)
            materialRef.current.uniforms.uColorB.value.set(...colorB)
            materialRef.current.uniforms.uColorC.value.set(...colorC)
            materialRef.current.uniforms.uColorD.value.set(...colorD)
        }
    })

    return (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[viewport.width, viewport.height]} />
            <shaderMaterial
                ref={materialRef}
                args={[SortingMaterial]}
            />
        </mesh>
    )
}
