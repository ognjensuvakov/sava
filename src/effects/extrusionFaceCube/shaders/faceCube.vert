uniform float uScale;
uniform float uTime;
uniform float uSpikeMax;
uniform vec3 uInteractPos;
uniform float uRadius;

varying float vIntensity;
varying vec3 vColorMix;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vec3 iLocalPos = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vec3 worldInstancePos = (modelMatrix * vec4(iLocalPos, 1.0)).xyz;
    
    // Calculate distance from world instance pos to intersection point
    float dist = distance(worldInstancePos, uInteractPos);
    
    float activeStrength = 0.0;
    
    // Add noise to the interaction distance so it's not a perfect circle
    float noiseVal = random(worldInstancePos.xz) * 0.5 + random(worldInstancePos.yz) * 0.5;
    float irregularRadius = uRadius * (0.7 + 0.6 * noiseVal);

    if (dist < irregularRadius) {
         float t = floor(uTime * 15.0);
         // Use world position to scramble noise for glitches
         float randVal = random(iLocalPos.xy + t + iLocalPos.z);
         
         float spike = step(0.6, randVal) * randVal * uSpikeMax;
         
         // Smooth out the very edge just enough to not be aliased, but don't do a full cone/pyramid falloff
         float edgeFade = smoothstep(irregularRadius, irregularRadius * 0.8, dist);
         
         activeStrength = edgeFade * (0.2 + spike);
    }
    
    float h = activeStrength * uScale;
    
    vec3 updatedPos = position;
    float stretch = 1.0 + h; 
    updatedPos.y = (updatedPos.y + 0.5) * stretch - 0.5;
    
    vec4 worldPos = modelMatrix * instanceMatrix * vec4(updatedPos, 1.0);
    gl_Position = projectionMatrix * viewMatrix * worldPos;

    vIntensity = activeStrength;
    vColorMix = vec3(activeStrength, position.y > 0.4 ? 1.0 : 0.0, 0.0);
}
