import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useControls } from 'leva'
import { FaceCubeNeedles } from './components/FaceCubeNeedles'
import { OrbitControls, RoundedBox, Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

export function ExtrusionFaceCubePage() {
    const interactRef = useRef(new THREE.Vector3(999, 999, 999))
    const groupRef = useRef<THREE.Group>(null)
    const [hovered, setHovered] = useState(false)

    const {
        cubeSize,
        detail,
        scale,
        spikeMax,
        thickness,
        radius,
        showBase,
        idleColor,
        motionFade,
        blurSpread,
        roundingRadius,
        cameraZ
    } = useControls('Face Cube Settings', {
        cubeSize: { value: 6.0, min: 2.0, max: 20.0 },
        detail: { value: 40, min: 10, max: 100, step: 1 },
        scale: { value: 3.5, min: 0.1, max: 10.0 },
        spikeMax: { value: 3.0, min: 0.5, max: 15.0 },
        thickness: { value: 0.05, min: 0.005, max: 0.2, step: 0.001 },
        radius: { value: 2.0, min: 0.5, max: 10.0 },
        showBase: true,
        idleColor: '#111111',
        motionFade: { value: 0.96, min: 0.8, max: 0.999 },
        blurSpread: { value: 1.5, min: 0.0, max: 5.0 },
        roundingRadius: { value: 0.5, min: 0.0, max: 2.0 },
        cameraZ: { value: 15.0, min: 5.0, max: 50.0 }
    })

    const { colorA, colorB, colorC, colorD } = useControls('Needle Palette', {
        colorA: [0.5, 0.5, 0.5],
        colorB: [0.5, 0.5, 0.5],
        colorC: [1.0, 1.0, 1.0],
        colorD: [0.00, 0.33, 0.67],
    })

    const { camera } = useThree()

    useEffect(() => {
        camera.position.set(0, 0, cameraZ)
    }, [camera, cameraZ])

    useFrame((_, delta) => {
        if (groupRef.current) {
            // Slight continuous rotation
            groupRef.current.rotation.y += delta * 0.1
            groupRef.current.rotation.x += delta * 0.05

            // If hovered, speed up the spin for extra juice
            if (hovered) {
                groupRef.current.rotation.y += delta * 0.6
                groupRef.current.rotation.x += delta * 0.2
            }
        }
    })

    const handlePointerMove = (e: any) => {
        if (e.point) {
            interactRef.current.copy(e.point)
        }
    }

    const handlePointerOut = () => {
        setHovered(false)
        document.body.style.cursor = "auto"
        // Send interaction point far away
        interactRef.current.set(999, 999, 999)
    }

    return (
        <>
            <group ref={groupRef}>
                {/* Trigger mesh for interaction point */}
                <RoundedBox
                    args={[cubeSize + 0.1, cubeSize + 0.1, cubeSize + 0.1]}
                    radius={roundingRadius}
                    onPointerMove={handlePointerMove}
                    onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
                    onPointerOut={handlePointerOut}
                >
                    <meshBasicMaterial transparent opacity={0.0} depthWrite={false} color="red" />
                </RoundedBox>

                {/* Solid base cube */}
                {showBase && (
                    <RoundedBox
                        args={[cubeSize * 0.99, cubeSize * 0.99, cubeSize * 0.99]}
                        radius={roundingRadius}
                    >
                        <meshBasicMaterial color={idleColor} transparent opacity={hovered ? 1.0 : 0.0} />
                    </RoundedBox>
                )}

                <FaceCubeNeedles
                    interactRef={interactRef}
                    radius={radius}
                    cubeSize={cubeSize}
                    detail={detail}
                    scale={scale}
                    thickness={thickness}
                    spikeMax={spikeMax}
                    colorA={colorA}
                    colorB={colorB}
                    colorC={colorC}
                    colorD={colorD}
                    idleColor={idleColor}
                    motionFade={motionFade}
                    blurSpread={blurSpread}
                    roundingRadius={roundingRadius}
                />
            </group>

            <EffectComposer>
                <Bloom luminanceThreshold={0.5} mipmapBlur intensity={0.5} />
            </EffectComposer>

            <OrbitControls makeDefault />

            {/* Display configuration JSON for easy copying */}
            <Html position={[-cubeSize * 1.5, cubeSize * 1.5, 0]} center>
                <div style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: '#00ff00',
                    padding: '15px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    width: '350px',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    pointerEvents: 'auto',
                    userSelect: 'text',
                    border: '1px solid #333',
                    whiteSpace: 'pre-wrap'
                }}>
                    <div style={{ marginBottom: '10px', color: '#fff', fontWeight: 'bold' }}>
                        Current Settings (Copy to Standalone widget):
                    </div>
                    {JSON.stringify({
                        cubeSize, detail, scale, spikeMax, thickness, radius, showBase, idleColor, motionFade, blurSpread, roundingRadius, cameraZ,
                        palette: { colorA, colorB, colorC, colorD }
                    }, null, 2)}
                </div>
            </Html>
        </>
    )
}
