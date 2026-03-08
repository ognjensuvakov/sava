import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useControls } from 'leva'
import { SurfaceNeedles } from './components/SurfaceNeedles'
import { OrbitControls } from '@react-three/drei'

export function ExtrusionObjectPage() {
    const interactRef = useRef(new THREE.Vector3(999, 999, 999))

    const { shape, size, detail, scale, thickness, radius, showBase, baseColor, metalness, roughness } = useControls('Object Needles', {
        shape: { options: ['Sphere', 'Torus', 'Plane'] },
        size: { value: 3.0, min: 1.0, max: 10.0 },
        detail: { value: 60, min: 10, max: 200, step: 1 }, // Added detail control
        scale: { value: 2.0, min: 0.1, max: 5.0 }, // height multiplier
        thickness: { value: 0.02, min: 0.005, max: 0.1, step: 0.001 },
        radius: { value: 1.5, min: 0.1, max: 5.0 }, // interaction radius
        showBase: true,
        baseColor: '#1d1d1d',
        metalness: { value: 0.8, min: 0, max: 1 },
        roughness: { value: 0.2, min: 0, max: 1 }
    })

    // Gradient Palette Settings (Same as V2)
    const { colorA, colorB, colorC, colorD } = useControls('Needle Palette', {
        colorA: [0.5, 0.5, 0.5],
        colorB: [0.5, 0.5, 0.5],
        colorC: [1.0, 1.0, 1.0],
        colorD: [0.00, 0.33, 0.67], // Default to blue hues mostly
    })

    // Construct high-density geometries depending on UI choice
    const geometry = useMemo(() => {
        let geom: THREE.BufferGeometry;
        if (shape === 'Sphere') {
            geom = new THREE.SphereGeometry(size, detail, detail) // use Sphere instead of Icosahedron for varying detail? 
        } else if (shape === 'Torus') {
            geom = new THREE.TorusGeometry(size, size * 0.4, Math.floor(detail / 1.5), detail * 2)
        } else {
            geom = new THREE.PlaneGeometry(size * 2, size * 2, detail, detail)
        }
        return geom
    }, [shape, size, detail])

    const handlePointerMove = (e: any) => {
        if (e.point) {
            interactRef.current.copy(e.point)
        }
    }

    // Default far away so it doesn't affect anything
    const handlePointerLeave = () => {
        interactRef.current.set(999, 999, 999)
    }

    return (
        <>
            {/* The transparent base shape that captures mouse events so we know exactly where on the surface the user is hovering */}
            <mesh
                geometry={geometry}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                rotation={shape === 'Plane' ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
            >
                {showBase ? (
                    <meshStandardMaterial
                        color={baseColor}
                        metalness={metalness}
                        roughness={roughness}
                        side={THREE.DoubleSide}
                    />
                ) : (
                    <meshBasicMaterial transparent opacity={0.0} depthWrite={false} color="red" />
                )}
            </mesh>

            <group rotation={shape === 'Plane' ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}>
                {/* The instanced needles that render on top of it */}
                <SurfaceNeedles
                    geometry={geometry}
                    interactRef={interactRef}
                    scale={scale}
                    radius={radius}
                    thickness={thickness}
                    colorA={colorA}
                    colorB={colorB}
                    colorC={colorC}
                    colorD={colorD}
                />
            </group>

            <OrbitControls makeDefault />
        </>
    )
}
