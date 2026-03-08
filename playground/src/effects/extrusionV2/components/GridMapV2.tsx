import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import gridVertexShader from '../shaders/gridV2.vert?raw'
import gridFragmentShader from '../shaders/gridV2.frag?raw'

const GridMaterial = {
    uniforms: {
        uTrail: { value: null },
        uHeightScale: { value: 2.0 },
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color() },
        uColorB: { value: new THREE.Color() },
        uColorC: { value: new THREE.Color() },
        uColorD: { value: new THREE.Color() },
    },
    vertexShader: gridVertexShader,
    fragmentShader: gridFragmentShader,
}

export type GridMapV2Props = {
    trailRef: React.MutableRefObject<THREE.Texture | null>
    scale: number
    thickness: number
    colorA: [number, number, number]
    colorB: [number, number, number]
    colorC: [number, number, number]
    colorD: [number, number, number]
}

export function GridMapV2({ trailRef, scale, thickness, colorA, colorB, colorC, colorD }: GridMapV2Props) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const materialRef = useRef<THREE.ShaderMaterial>(null)

    // Higher density grid for "Needles"
    const gridDim = 300
    const count = gridDim * gridDim // 90,000 items
    const gridSize = 20
    const dummy = new THREE.Object3D()

    // Initialize positions
    useMemo(() => {
        if (!meshRef.current) return

        let i = 0
        for (let x = 0; x < gridDim; x++) {
            for (let z = 0; z < gridDim; z++) {
                const posX = (x / gridDim) * gridSize - (gridSize / 2)
                const posZ = (z / gridDim) * gridSize - (gridSize / 2)

                // Add a very tiny random offset to position so it's not a perfect grid
                const offsetX = (Math.random() - 0.5) * 0.05
                const offsetZ = (Math.random() - 0.5) * 0.05

                dummy.position.set(posX + offsetX, 0, posZ + offsetZ)
                dummy.updateMatrix()
                meshRef.current.setMatrixAt(i++, dummy.matrix)
            }
        }
        meshRef.current.instanceMatrix.needsUpdate = true
    }, [gridDim])

    useEffect(() => {
        if (meshRef.current) {
            let i = 0
            for (let x = 0; x < gridDim; x++) {
                for (let z = 0; z < gridDim; z++) {
                    const posX = (x / gridDim) * gridSize - (gridSize / 2)
                    const posZ = (z / gridDim) * gridSize - (gridSize / 2)

                    const offsetX = (Math.random() - 0.5) * 0.05
                    const offsetZ = (Math.random() - 0.5) * 0.05

                    dummy.position.set(posX + offsetX, 0, posZ + offsetZ)
                    dummy.updateMatrix()
                    meshRef.current.setMatrixAt(i++, dummy.matrix)
                }
            }
            meshRef.current.instanceMatrix.needsUpdate = true
        }
    }, [gridDim])

    useFrame((state) => {
        if (materialRef.current) {
            if (trailRef.current) {
                materialRef.current.uniforms.uTrail.value = trailRef.current
            }
            materialRef.current.uniforms.uHeightScale.value = scale
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime

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
                args={[GridMaterial]}
            />
        </instancedMesh>
    )
}
