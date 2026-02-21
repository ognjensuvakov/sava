import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import gridVertexShader from '../shaders/grid.vert?raw'
import gridFragmentShader from '../shaders/grid.frag?raw'

const GridMaterial = {
    uniforms: {
        uTrail: { value: null },
        uHeightScale: { value: 2.0 },
        uColorHead: { value: new THREE.Color('#ffffff') }, // Pixel head
        uColorTail: { value: new THREE.Color('#145FD8') }, // Tether body (Blue)
    },
    vertexShader: gridVertexShader,
    fragmentShader: gridFragmentShader,
}

export type GridMapProps = {
    trailRef: React.MutableRefObject<THREE.Texture | null>
    scale: number
    colorHead: string
    colorTail: string
}

export function GridMap({ trailRef, scale, colorHead, colorTail }: GridMapProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const materialRef = useRef<THREE.ShaderMaterial>(null)

    // Grid config
    const count = 100 * 100 // 10k items
    const gridSize = 20
    const dummy = new THREE.Object3D()

    useMemo(() => {
        // We set positions once. The shader handles displacement.
        if (!meshRef.current) return

        let i = 0
        for (let x = 0; x < 100; x++) {
            for (let z = 0; z < 100; z++) {
                // Map 0..100 to -10..10
                const posX = (x / 100) * gridSize - (gridSize / 2)
                const posZ = (z / 100) * gridSize - (gridSize / 2)

                dummy.position.set(posX, 0, posZ)
                dummy.updateMatrix()
                meshRef.current.setMatrixAt(i++, dummy.matrix)
            }
        }
        meshRef.current.instanceMatrix.needsUpdate = true
    }, [])

    // HACK: To make sure init happens if ref was null initially
    useEffect(() => {
        if (meshRef.current) {
            let i = 0
            for (let x = 0; x < 100; x++) {
                for (let z = 0; z < 100; z++) {
                    const posX = (x / 100) * gridSize - (gridSize / 2)
                    const posZ = (z / 100) * gridSize - (gridSize / 2)

                    dummy.position.set(posX, 0, posZ)
                    dummy.updateMatrix()
                    meshRef.current.setMatrixAt(i++, dummy.matrix)
                }
            }
            meshRef.current.instanceMatrix.needsUpdate = true
        }
    }, [])

    useFrame(() => {
        if (materialRef.current) {
            if (trailRef.current) {
                materialRef.current.uniforms.uTrail.value = trailRef.current
            }
            materialRef.current.uniforms.uHeightScale.value = scale
            materialRef.current.uniforms.uColorHead.value.set(colorHead)
            materialRef.current.uniforms.uColorTail.value.set(colorTail)
        }
    })

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} >
            <boxGeometry args={[0.04, 1, 0.04]} />
            <shaderMaterial
                ref={materialRef}
                args={[GridMaterial]}
            />
        </instancedMesh>
    )
}
