uniform sampler2D uTrail;
uniform float uHeightScale;
uniform float uTime;

varying vec3 vColorMix;
varying float vHeight;
varying vec2 vUv;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vUv = uv;
    
    vec3 iPos = instanceMatrix[3].xyz; 
    
    // Assume grid is 20x20
    vec2 mapUv = (iPos.xz / 20.0) + 0.5;
    
    // Sample trail
    float trail = texture2D(uTrail, mapUv).r;
    
    // Slow down the random jump to ~15fps
    float t = floor(uTime * 15.0);
    float randVal = random(mapUv + t);
    
    // "Pixel Sort" effect: jump up sharply but only where trail is active
    float activeStrength = trail * (0.2 + step(0.6, randVal) * randVal * 2.5);
    
    float h = activeStrength * uHeightScale;
    
    vec3 updatedPos = position;
    // Scale height
    float stretch = 1.0 + h * 8.0; 
    
    // Apply stretch relative to bottom
    updatedPos.y = (updatedPos.y + 0.5) * stretch - 0.5;
    
    vec3 worldPos = iPos + updatedPos; 
    
    gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
    
    // Pass info to frag shader
    vHeight = trail;
    vColorMix = vec3(activeStrength, position.y > 0.4 ? 1.0 : 0.0, 0.0);
}
