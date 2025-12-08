import { useFBO } from '@react-three/drei'
import { useFrame, useThree, createPortal } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import simulationVertexShader from '../shaders/simulation.vert?raw'
import simulationFragmentShader from '../shaders/simulation.frag?raw'

const SimulationMaterial = {
    uniforms: {
        uTexture: { value: null },
        uResolution: { value: new THREE.Vector2() },
        uMouse: { value: new THREE.Vector3(0, 0, 0) },
        uFrame: { value: 0 },
        uDelta: { value: 0.1 },
        uDamping: { value: 0.002 },
        uPressureDamping: { value: 0.999 },
    },
    vertexShader: simulationVertexShader,
    fragmentShader: simulationFragmentShader,
}

export type WaterSimulationProps = {
    options: {
        delta: number
        damping: number
        pressureDamping: number
    }
    mouse: React.MutableRefObject<THREE.Vector3>
    outputRef: React.MutableRefObject<THREE.Texture | null>
    width: number
    height: number
}

export function WaterSimulation({ options, mouse, outputRef, width, height }: WaterSimulationProps) {
    const resolution = 512
    const widthRes = Math.floor(resolution * (width / height))
    const heightRes = resolution

    const bufferA = useFBO(widthRes, heightRes, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        stencilBuffer: false,
        depthBuffer: false,
    })

    const bufferB = useFBO(widthRes, heightRes, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
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
        frame: 0
    })

    useMemo(() => {
        state.current.read = bufferA
        state.current.write = bufferB
        state.current.frame = 0
    }, [bufferA, bufferB])

    const { gl } = useThree()

    useFrame((_state) => {
        if (!meshRef.current || !materialRef.current) return

        const { read, write } = state.current

        // Simulation updates
        materialRef.current.uniforms.uTexture.value = read.texture
        materialRef.current.uniforms.uResolution.value.set(widthRes, heightRes)
        materialRef.current.uniforms.uFrame.value = state.current.frame++
        materialRef.current.uniforms.uMouse.value.copy(mouse.current)
        materialRef.current.uniforms.uDelta.value = options.delta
        materialRef.current.uniforms.uDamping.value = options.damping
        materialRef.current.uniforms.uPressureDamping.value = options.pressureDamping

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
                args={[SimulationMaterial]}
            />
        </mesh>,
        scene
    )
}
