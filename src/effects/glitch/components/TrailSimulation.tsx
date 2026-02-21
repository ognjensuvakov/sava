import { useFBO } from '@react-three/drei'
import { useFrame, useThree, createPortal } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import commonVertexShader from '../shaders/common.vert?raw'
import trailFragmentShader from '../shaders/trail.frag?raw'

const TrailMaterial = {
    uniforms: {
        uTexture: { value: null },
        uMouse: { value: new THREE.Vector3(0, 0, 0) },
        uResolution: { value: new THREE.Vector2() },
        uFade: { value: 0.98 },
        uSize: { value: 0.05 },
    },
    vertexShader: commonVertexShader,
    fragmentShader: trailFragmentShader,
}

export type TrailSimulationProps = {
    options: {
        fade: number
        size: number
    }
    mouse: React.MutableRefObject<THREE.Vector3>
    outputRef: React.MutableRefObject<THREE.Texture | null>
}

export function TrailSimulation({ options, mouse, outputRef }: TrailSimulationProps) {
    const { size } = useThree()
    const widthRes = size.width
    const heightRes = size.height

    const bufferA = useFBO(widthRes, heightRes, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        stencilBuffer: false,
        depthBuffer: false,
    })

    const bufferB = useFBO(widthRes, heightRes, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        stencilBuffer: false,
        depthBuffer: false,
    })

    const scene = useMemo(() => new THREE.Scene(), [])
    const camera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])
    const meshRef = useRef<THREE.Mesh>(null)
    const materialRef = useRef<THREE.ShaderMaterial>(null)

    // Force update state refs when buffers change
    const state = useRef({
        read: bufferA,
        write: bufferB,
    })

    useMemo(() => {
        state.current.read = bufferA
        state.current.write = bufferB
    }, [bufferA, bufferB])

    const { gl } = useThree()

    useFrame(() => {
        if (!meshRef.current || !materialRef.current) return

        const { read, write } = state.current

        // Simulation updates
        materialRef.current.uniforms.uTexture.value = read.texture
        materialRef.current.uniforms.uMouse.value.copy(mouse.current)
        materialRef.current.uniforms.uResolution.value.set(widthRes, heightRes)
        materialRef.current.uniforms.uFade.value = options.fade
        materialRef.current.uniforms.uSize.value = options.size

        // Render logic
        gl.setRenderTarget(write)
        gl.clear()
        gl.render(scene, camera)
        gl.setRenderTarget(null)

        // Swap
        const temp = state.current.read
        state.current.read = state.current.write
        state.current.write = temp

        // Update output ref for the consumer
        outputRef.current = state.current.read.texture
    })

    return createPortal(
        <mesh ref={meshRef}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                ref={materialRef}
                args={[TrailMaterial]}
            />
        </mesh>,
        scene
    )
}
