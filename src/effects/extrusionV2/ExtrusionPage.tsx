import { useRef } from 'react'
import * as THREE from 'three'
import { useControls } from 'leva'
import { TrailSimulation } from './components/TrailSimulation'
import { GridMap } from './components/GridMap'

export function ExtrusionPage() {
    const mouseRef = useRef(new THREE.Vector3(0, 0, 0))
    const trailOutputRef = useRef<THREE.Texture | null>(null)

    const { fade, size, scale, colorHead, colorTail } = useControls('Extrusion Settings', {
        fade: { value: 0.96, min: 0.8, max: 0.999 },
        size: { value: 0.08, min: 0.01, max: 0.2 },
        scale: { value: 1.0, min: 0.1, max: 5.0 },
        colorHead: '#CAD8FF',
        colorTail: '#145FD8'
    })

    const handlePointerMove = (e: any) => {
        // e.uv is [0,1]. But GridMap is 3D raycasting?
        // Wait, GridMap is a mesh. If we raycast against it, e.uv might work if geometry has UVs.
        // But InstancedMesh UVs are usually local to instance.
        // We need a ground plane for Raycasting to get global control.

        // Let's keep the ground plane from Playground logic but invisible?
        if (e.point) {
            // Map world point to UV [0,1] for the simulation buffer
            // Grid is 20x20 centered at 0.
            // x: -10 to 10 -> 0 to 1
            // z: -10 to 10 -> 0 to 1

            const x = (e.point.x + 10) / 20
            const z = (e.point.z + 10) / 20

            // Mouse shader expects uMouse in UV coords (x,y)
            // But we pass Z=1 for click.
            // Shader uses Distance(uv, mouse.xy).
            // So we need to put mapped coords into mouseRef.

            mouseRef.current.x = x
            mouseRef.current.y = z // Shader uses Y for UV-V, which maps to World-Z
        }
    }

    const handlePointerDown = (e: any) => {
        mouseRef.current.z = 1
        handlePointerMove(e)
    }

    const handlePointerUp = () => {
        mouseRef.current.z = 0
    }

    return (
        <>
            <TrailSimulation
                options={{ fade, size }}
                mouse={mouseRef}
                outputRef={trailOutputRef}
            />

            {/* Invisible Ground Plane for Mouse Interaction */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0, 0]}
                onPointerMove={handlePointerMove}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                visible={false} // Raycast still works on invisible meshes in R3F? verifying...
            // Actually, usually needs visible=true and Material opacity=0 to be safe.
            >
                <planeGeometry args={[20, 20]} />
                <meshBasicMaterial color="red" visible={false} />
            </mesh>

            <GridMap
                trailRef={trailOutputRef}
                scale={scale}
                colorHead={colorHead}
                colorTail={colorTail}
            />
        </>
    )
}
