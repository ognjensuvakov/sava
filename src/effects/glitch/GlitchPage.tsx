import { useRef } from 'react'
import * as THREE from 'three'
import { useControls } from 'leva'
import { TrailSimulation } from './components/TrailSimulation' // Updated path
import { SortingPlane } from './components/SortingPlane' // Updated path

export function GlitchPage() {
    const mouseRef = useRef(new THREE.Vector3(0, 0, 0))
    const trailOutputRef = useRef<THREE.Texture | null>(null)

    const { fade, size, threshold } = useControls('Glitch Settings', {
        fade: { value: 0.96, min: 0.8, max: 0.999 },
        size: { value: 0.05, min: 0.01, max: 0.2 },
        threshold: { value: 0.1, min: 0.0, max: 1.0 }
    })

    // Vectors provided by user:
    // a: [0.543 0.030 0.563] -> #8A078F (approx)
    // b: [0.827 0.907 0.754] -> #D2E7C0
    // c: [1.054 1.394 1.047] -> #... (Using raw vectors in shader is cleaner but Leva wants hex)
    // We will let user control them via HEX but init with those values if converted, or just raw numbers?
    // User asked: "add to some constants".
    // I will hardcode them as defaults, but maybe expose them? 
    // To respect the "add to some constants" request specifically for that vector set, I'll use them as the defaults.

    // Converting the user's vectors to approx hex for Leva defaults:
    // A: 0.543, 0.030, 0.563 -> #8B0890
    // B: 0.827, 0.907, 0.754 -> #D3E7C0
    // C: 1.054, 1.394, 1.047 -> #FFFFFF (clamped) or just vivid. Let's rely on shader math.
    // D: 1.707, 1.572, 5.885 -> #FFFFFF (clamped)

    // Actually, since these "cosine gradient" params often go outside 0-1, 
    // using a color picker is misleading. 
    // I will expose them as FOLDER with NUMBER inputs so the user can see/edit the raw vectors. This is better for "constants".

    const palette = useControls('Cosine Palette', {
        ColorA: { value: [0.543, 0.030, 0.563] },
        ColorB: { value: [0.827, 0.907, 0.754] },
        ColorC: { value: [1.054, 1.394, 1.047] },
        ColorD: { value: [1.707, 1.572, 5.885] },
    })

    const handlePointerMove = (e: any) => {
        // e.uv is [0,1].
        if (e.uv) {
            mouseRef.current.x = e.uv.x
            mouseRef.current.y = e.uv.y
        }
    }

    const handlePointerDown = (e: any) => {
        mouseRef.current.z = 1
        handlePointerMove(e)
    }

    const handlePointerUp = () => {
        mouseRef.current.z = 0
    }

    // Helper to convert array to hex string for SortingPlane props (which expects string for standard uniformity)
    // Wait, SortingPlane expects strings in my previous step. I should update SortingPlane to accept Vector3 or just convert here.
    // The shader `sorting.frag` takes vec3. 
    // Ideally `SortingPlane` should take the raw numbers. 
    // I defined `colorA: string` in SortingPlane.tsx. I should fix that to accept the arrays/vectors or convert here.
    // I'll convert here for now to avoid re-editing SortingPlane immediately, 
    // OR better: edit SortingPlane to accept [number, number, number] since that's what we have.
    // Actually, I'll stick to string props for now to match the existing pattern, BUT wait...
    // The user specifically gave vectors > 1.0 (e.g. 5.885). Hex colors CLAMP to 0-1. 
    // So passing strings is BAD. I MUST pass vectors.
    // I will re-edit `SortingPlane.tsx` in the next step to accept number arrays.

    return (
        <>
            <TrailSimulation
                options={{ fade, size }}
                mouse={mouseRef}
                outputRef={trailOutputRef}
            />

            <group
                onPointerMove={handlePointerMove}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
            >
                {/* 
                  Passing the raw arrays to the component. 
                  Use `any` cast temporarily if types conflict until I fix SortingPlane type.
                */}
                <SortingPlane
                    trailRef={trailOutputRef}
                    threshold={threshold}
                    colorA={palette.ColorA as any}
                    colorB={palette.ColorB as any}
                    colorC={palette.ColorC as any}
                    colorD={palette.ColorD as any}
                />
            </group>
        </>
    )
}
