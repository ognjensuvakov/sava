import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import faceCubeVertexShader from '../shaders/faceCube.vert?raw'
import faceCubeFragmentShader from '../shaders/faceCube.frag?raw'

const MAX_TRAIL = 64

const FaceCubeMaterial = {
    uniforms: {
        uTrail: { value: new Array(MAX_TRAIL).fill(null).map(() => new THREE.Vector4(999, 999, 999, 0)) },
        uBlurSpread: { value: 1.5 },
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
    motionFade: number
    blurSpread: number
    roundingRadius: number
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
    idleColor,
    motionFade,
    blurSpread,
    roundingRadius
}: FaceCubeNeedlesProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const materialRef = useRef<THREE.ShaderMaterial>(null)
    const trailData = useRef<THREE.Vector4[]>(new Array(MAX_TRAIL).fill(null).map(() => new THREE.Vector4(999, 999, 999, 0)))

    const geometry = useMemo(() => {
        // We don't use RoundedBoxGeometry because it concentrates vertices ONLY at the corners/edges.
        // We want a uniform scatter across the flat faces AND the corners.
        // So we start with a dense standard box...
        const boxGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize, detail, detail, detail)

        const posAttr = boxGeo.getAttribute('position')
        const normAttr = boxGeo.getAttribute('normal')

        // The mathematical inner sharp box
        const innerHalf = Math.max(0, cubeSize / 2 - roundingRadius)

        for (let i = 0; i < posAttr.count; i++) {
            const px = posAttr.getX(i)
            const py = posAttr.getY(i)
            const pz = posAttr.getZ(i)

            // Find closest geometric point on the inner sharp box
            const cx = Math.max(-innerHalf, Math.min(innerHalf, px))
            const cy = Math.max(-innerHalf, Math.min(innerHalf, py))
            const cz = Math.max(-innerHalf, Math.min(innerHalf, pz))

            // Vector pointing outward from the inner box surface
            const dx = px - cx
            const dy = py - cy
            const dz = pz - cz

            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

            let nx, ny, nz
            if (dist > 0.0001) {
                // In the rounding corners, surface normal points away from the inner corner
                nx = dx / dist
                ny = dy / dist
                nz = dz / dist
            } else {
                // Flat face areas keep their flat normal
                nx = normAttr.getX(i)
                ny = normAttr.getY(i)
                nz = normAttr.getZ(i)
            }

            // Project vertex outwards by roundingRadius to form the final rounded box
            posAttr.setXYZ(i, cx + nx * roundingRadius, cy + ny * roundingRadius, cz + nz * roundingRadius)
            // Overwrite the normal for our needle lookAt
            normAttr.setXYZ(i, nx, ny, nz)
        }

        return boxGeo
    }, [cubeSize, detail, roundingRadius])

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
        // Update trail array
        for (let i = MAX_TRAIL - 1; i > 0; i--) {
            trailData.current[i].copy(trailData.current[i - 1])
            trailData.current[i].w *= motionFade
            if (trailData.current[i].w < 0.001) trailData.current[i].w = 0
        }
        const isActive = interactRef.current.x < 900 ? 1.0 : 0.0
        trailData.current[0].set(interactRef.current.x, interactRef.current.y, interactRef.current.z, isActive)

        if (materialRef.current) {
            materialRef.current.uniforms.uTrail.value = trailData.current
            materialRef.current.uniforms.uBlurSpread.value = blurSpread
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
