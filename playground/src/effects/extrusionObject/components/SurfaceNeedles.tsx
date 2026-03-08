import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import surfaceVertexShader from '../shaders/surface.vert?raw'
import surfaceFragmentShader from '../shaders/surface.frag?raw'

const SurfaceMaterial = {
    uniforms: {
        uInteractPos: { value: new THREE.Vector3(999, 999, 999) },
        uTime: { value: 0 },
        uScale: { value: 1.0 },
        uRadius: { value: 2.0 },
        uColorA: { value: new THREE.Color() },
        uColorB: { value: new THREE.Color() },
        uColorC: { value: new THREE.Color() },
        uColorD: { value: new THREE.Color() },
    },
    vertexShader: surfaceVertexShader,
    fragmentShader: surfaceFragmentShader,
}

export type SurfaceNeedlesProps = {
    geometry: THREE.BufferGeometry
    interactRef: React.MutableRefObject<THREE.Vector3>
    scale: number
    radius: number
    thickness: number
    colorA: [number, number, number]
    colorB: [number, number, number]
    colorC: [number, number, number]
    colorD: [number, number, number]
}

export function SurfaceNeedles({
    geometry,
    interactRef,
    scale,
    radius,
    thickness,
    colorA,
    colorB,
    colorC,
    colorD
}: SurfaceNeedlesProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const materialRef = useRef<THREE.ShaderMaterial>(null)

    // Analyze geometry
    const vertexData = useMemo(() => {
        const posAttr = geometry.getAttribute('position')
        const normAttr = geometry.getAttribute('normal')
        if (!posAttr || !normAttr) return null

        return { count: posAttr.count, posAttr, normAttr }
    }, [geometry])

    // Safety check just in case
    const count = vertexData?.count || 0

    // Initialize instances
    useEffect(() => {
        if (!meshRef.current || !vertexData) return

        const dummy = new THREE.Object3D()
        const pos = new THREE.Vector3()
        const norm = new THREE.Vector3()

        for (let i = 0; i < vertexData.count; i++) {
            pos.fromBufferAttribute(vertexData.posAttr, i)
            norm.fromBufferAttribute(vertexData.normAttr, i)

            // Avoid overlapping perfectly identical vertices (like at the poles of a sphere)
            // But for simplicity, we just place a box per vertex
            dummy.position.copy(pos)

            // Orient along normal (lookAt points the local Z axis to the target)
            // We want the box's Y axis to align with normal (since we stretch Y in shader)
            // By default, lookAt points local Z to the target. So if we rotateX(-Math.PI/2) BEFORE looking at, or something similar.
            dummy.lookAt(pos.clone().add(norm))
            dummy.rotateX(Math.PI / 2) // Now local Y points along the normal

            dummy.updateMatrix()
            meshRef.current.setMatrixAt(i, dummy.matrix)
        }
        meshRef.current.instanceMatrix.needsUpdate = true
    }, [vertexData])

    useFrame((state) => {
        if (materialRef.current && vertexData) {
            materialRef.current.uniforms.uInteractPos.value.copy(interactRef.current)
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
            materialRef.current.uniforms.uScale.value = scale
            materialRef.current.uniforms.uRadius.value = radius

            materialRef.current.uniforms.uColorA.value.fromArray(colorA)
            materialRef.current.uniforms.uColorB.value.fromArray(colorB)
            materialRef.current.uniforms.uColorC.value.fromArray(colorC)
            materialRef.current.uniforms.uColorD.value.fromArray(colorD)
        }
    })

    if (!vertexData) return null

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} >
            <boxGeometry args={[thickness, 1, thickness]} />
            <shaderMaterial
                ref={materialRef}
                args={[SurfaceMaterial]}
            />
        </instancedMesh>
    )
}
