import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import faceCubeVertexShader from '../shaders/faceCube.vert?raw'
import faceCubeFragmentShader from '../shaders/faceCube.frag?raw'

const FaceCubeMaterial = {
    uniforms: {
        uInteractPos: { value: new THREE.Vector3(999, 999, 999) },
        uRadius: { value: 2.0 },
        uTime: { value: 0 },
        uScale: { value: 1.0 },
        uSpikeMax: { value: 5.0 },
        uColorA: { value: new THREE.Color() },
        uColorB: { value: new THREE.Color() },
        uColorC: { value: new THREE.Color() },
        uColorD: { value: new THREE.Color() },
        uIdleColor: { value: new THREE.Color('#111111') },
    },
    vertexShader: faceCubeVertexShader,
    fragmentShader: faceCubeFragmentShader
}

export type FaceCubeNeedlesProps = {
    interactRef: React.MutableRefObject<THREE.Vector3>
    radius: number
    cubeSize: number
    detail: number
    scale: number
    thickness: number
    spikeMax: number
    colorA: [number, number, number]
    colorB: [number, number, number]
    colorC: [number, number, number]
    colorD: [number, number, number]
    idleColor: string
}

export function FaceCubeNeedles({
    interactRef,
    radius,
    cubeSize,
    detail,
    scale,
    thickness,
    spikeMax,
    colorA,
    colorB,
    colorC,
    colorD,
    idleColor
}: FaceCubeNeedlesProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const materialRef = useRef<THREE.ShaderMaterial>(null)

    const geometry = useMemo(() => new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize, detail, detail, detail), [cubeSize, detail])

    const count = geometry.attributes.position.count

    useEffect(() => {
        if (!meshRef.current) return

        const dummy = new THREE.Object3D()
        const pos = new THREE.Vector3()
        const norm = new THREE.Vector3()

        const posAttr = geometry.getAttribute('position')
        const normAttr = geometry.getAttribute('normal')

        for (let i = 0; i < count; i++) {
            pos.fromBufferAttribute(posAttr, i)
            norm.fromBufferAttribute(normAttr, i)

            // Very subtle jitter for natural scattering
            const offsetX = (Math.random() - 0.5) * (cubeSize / detail) * 0.2
            const offsetY = (Math.random() - 0.5) * (cubeSize / detail) * 0.2
            const offsetZ = (Math.random() - 0.5) * (cubeSize / detail) * 0.2

            dummy.position.copy(pos).add(new THREE.Vector3(offsetX, offsetY, offsetZ))

            // Needles point outward relative to face normal
            dummy.lookAt(pos.clone().add(norm))
            dummy.rotateX(Math.PI / 2)

            dummy.updateMatrix()
            meshRef.current.setMatrixAt(i, dummy.matrix)
        }
        meshRef.current.instanceMatrix.needsUpdate = true
    }, [geometry, count, cubeSize, detail])

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uInteractPos.value.copy(interactRef.current)
            materialRef.current.uniforms.uRadius.value = radius

            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
            materialRef.current.uniforms.uScale.value = scale
            materialRef.current.uniforms.uSpikeMax.value = spikeMax

            materialRef.current.uniforms.uColorA.value.fromArray(colorA)
            materialRef.current.uniforms.uColorB.value.fromArray(colorB)
            materialRef.current.uniforms.uColorC.value.fromArray(colorC)
            materialRef.current.uniforms.uColorD.value.fromArray(colorD)
            materialRef.current.uniforms.uIdleColor.value.set(idleColor)
        }
    })

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} >
            <boxGeometry args={[thickness, 1, thickness]} />
            <shaderMaterial
                ref={materialRef}
                args={[FaceCubeMaterial]}
            />
        </instancedMesh>
    )
}
