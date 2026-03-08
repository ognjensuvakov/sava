import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import planeVertexShader from '../shaders/plane.vert?raw'
import planeFragmentShader from '../shaders/plane.frag?raw'

const PlaneMaterial = {
    uniforms: {
        uTrail: { value: null },
        uTime: { value: 0 },
        uScale: { value: 1.0 },
        uSpikeMax: { value: 5.0 },
        uColorA: { value: new THREE.Color() },
        uColorB: { value: new THREE.Color() },
        uColorC: { value: new THREE.Color() },
        uColorD: { value: new THREE.Color() },
    },
    vertexShader: planeVertexShader,
    fragmentShader: planeFragmentShader,
}

export type PlaneNeedlesProps = {
    trailRef: React.MutableRefObject<THREE.Texture | null>
    planeSize: number
    detail: number
    scale: number
    thickness: number
    spikeMax: number
    colorA: [number, number, number]
    colorB: [number, number, number]
    colorC: [number, number, number]
    colorD: [number, number, number]
}

export function PlaneNeedles({
    trailRef,
    planeSize,
    detail,
    scale,
    thickness,
    spikeMax,
    colorA,
    colorB,
    colorC,
    colorD
}: PlaneNeedlesProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const materialRef = useRef<THREE.ShaderMaterial>(null)

    const count = detail * detail

    useEffect(() => {
        if (!meshRef.current) return

        const dummy = new THREE.Object3D()
        let i = 0
        for (let x = 0; x < detail; x++) {
            for (let z = 0; z < detail; z++) {
                const posX = (x / detail) * planeSize - (planeSize / 2) + (planeSize / (detail * 2))
                const posZ = (z / detail) * planeSize - (planeSize / 2) + (planeSize / (detail * 2))

                // Optional: tiny jitter to make it slightly imperfect like V2
                const offsetX = (Math.random() - 0.5) * (planeSize / detail) * 0.2
                const offsetZ = (Math.random() - 0.5) * (planeSize / detail) * 0.2

                dummy.position.set(posX + offsetX, 0, posZ + offsetZ)
                dummy.updateMatrix()
                meshRef.current.setMatrixAt(i++, dummy.matrix)
            }
        }
        meshRef.current.instanceMatrix.needsUpdate = true
    }, [detail, planeSize])

    useFrame((state) => {
        if (materialRef.current) {
            if (trailRef.current) {
                materialRef.current.uniforms.uTrail.value = trailRef.current
            }
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
            materialRef.current.uniforms.uScale.value = scale
            materialRef.current.uniforms.uSpikeMax.value = spikeMax

            materialRef.current.uniforms.uColorA.value.fromArray(colorA)
            materialRef.current.uniforms.uColorB.value.fromArray(colorB)
            materialRef.current.uniforms.uColorC.value.fromArray(colorC)
            materialRef.current.uniforms.uColorD.value.fromArray(colorD)
        }
    })

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} >
            <boxGeometry args={[thickness, 1, thickness]} />
            <shaderMaterial
                ref={materialRef}
                args={[PlaneMaterial]}
            />
        </instancedMesh>
    )
}
