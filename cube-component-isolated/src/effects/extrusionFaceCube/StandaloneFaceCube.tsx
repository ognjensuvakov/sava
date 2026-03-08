import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { FaceCubeNeedles } from './components/FaceCubeNeedles'
import { OrbitControls, RoundedBox } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

// Default hardcoded settings, easily replaceable by the designer
const SETTINGS = {
    "cubeSize": 6,
    "detail": 40,
    "scale": 0.1,
    "spikeMax": 0.5,
    "thickness": 0.1,
    "radius": 2,
    "showBase": true,
    "idleColor": "#111111",
    "motionFade": 0.999,
    "blurSpread": 0,
    "roundingRadius": 0.5,
    "cameraZ": 18,
    "palette": {
        "colorA": [
            0.1,
            0.1,
            0.7
        ] as [number, number, number],
        "colorB": [
            0.3,
            0.4,
            0.3
        ] as [number, number, number],
        "colorC": [
            0.7,
            0.9,
            0.9
        ] as [number, number, number],
        "colorD": [
            0.8,
            0.9,
            0.67
        ] as [number, number, number]
    }
};

export function StandaloneFaceCube() {
    const interactRef = useRef(new THREE.Vector3(999, 999, 999))
    const groupRef = useRef<THREE.Group>(null)
    const [hovered, setHovered] = useState(false)

    // Destructure settings for easy passing
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
        cameraZ,
        palette
    } = SETTINGS

    const { colorA, colorB, colorC, colorD } = palette

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

            <OrbitControls makeDefault enableZoom={false} />
        </>
    )
}
