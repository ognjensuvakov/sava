uniform sampler2D uTrail;
uniform float uScale;
uniform float uTime;
uniform float uSpikeMax;
uniform float uEdgeFade;

varying float vIntensity;
varying vec3 vColorMix;

// Stored per-instance height that persists between frames
// We don't have per-instance storage in the vertex shader, so we use
// a deterministic random that changes slowly.

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    // Instance positions are generated flat on the XZ plane centered at 0,0,0
    vec3 iLocalPos = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    
    // Map iLocalPos [-planeSize/2, planeSize/2] to UV [0, 1]
    // We'll pass the plane size or just assume 20.0 for now, but better to use a uniform if it's dynamic.
    // However, TrailSimulation usually defaults to a certain world area. 
    // In ExtrusionPage it was 20x20. We should keep it consistent.
    vec2 mapUv = (iLocalPos.xz / 20.0) + 0.5;
    
    // Sample trail
    float trail = texture2D(uTrail, mapUv).r;
    
    float activeStrength = 0.0;
    if(trail > 0.0) {
         // Snap time for glitch effect (~15 updates per second)
         float t = floor(uTime * 15.0);
         float randVal = random(iLocalPos.xz + t);
         
         // Random spike height scaled by trail intensity
         float spike = randVal * uSpikeMax;
         
         activeStrength = trail * spike;
    }
    
    float h = activeStrength * uScale;
    
    vec3 updatedPos = position;
    
    // Stretch from bottom. BoxGeometry Y is -0.5 to 0.5.
    float stretch = 1.0 + h; 
    updatedPos.y = (updatedPos.y + 0.5) * stretch - 0.5;
    
    vec4 worldPos = modelMatrix * instanceMatrix * vec4(updatedPos, 1.0);
    gl_Position = projectionMatrix * viewMatrix * worldPos;

    vIntensity = activeStrength;
    vColorMix = vec3(activeStrength, position.y > 0.4 ? 1.0 : 0.0, 0.0);
}
