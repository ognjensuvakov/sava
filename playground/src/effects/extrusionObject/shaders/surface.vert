uniform vec3 uInteractPos;
uniform float uRadius;
uniform float uScale;
uniform float uTime;

varying float vIntensity;
varying vec3 vColorMix;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    // instanceMatrix gives the orientation and placement on the surface relative to mesh
    vec3 iPos = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    
    // Convert to world space to match uInteractPos
    vec3 worldInstancePos = (modelMatrix * vec4(iPos, 1.0)).xyz;
    
    float dist = distance(worldInstancePos, uInteractPos);
    
    float activeStrength = 0.0;
    if(dist < uRadius) {
         float falloff = 1.0 - (dist / uRadius);
         // Snap time for glitch
         float t = floor(uTime * 15.0);
         float randVal = random(worldInstancePos.xy + t + worldInstancePos.z);
         
         // Spike logic
         activeStrength = falloff * (0.2 + step(0.6, randVal) * randVal * 3.0);
    }
    
    float h = activeStrength * uScale;
    
    vec3 updatedPos = position;
    float stretch = 1.0 + h * 8.0; 
    
    // Stretch relative to bottom (-0.5). BoxGeometry is centered by default.
    updatedPos.y = (updatedPos.y + 0.5) * stretch - 0.5;
    
    // Apply full instance matrix (rotation + pos) to stretched shape
    vec4 worldPos = instanceMatrix * vec4(updatedPos, 1.0);
    
    gl_Position = projectionMatrix * viewMatrix * worldPos;

    vIntensity = activeStrength;
    vColorMix = vec3(activeStrength, position.y > 0.4 ? 1.0 : 0.0, 0.0);
}
