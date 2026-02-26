uniform float uScale;
uniform float uTime;
uniform float uSpikeMax;
uniform float uHoverState;

varying float vIntensity;
varying vec3 vColorMix;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vec3 iLocalPos = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vec3 worldInstancePos = (modelMatrix * vec4(iLocalPos, 1.0)).xyz;
    
    float activeStrength = 0.0;
    
    if (uHoverState > 0.0) {
         float t = floor(uTime * 15.0);
         float randVal = random(iLocalPos.xy + t + iLocalPos.z);
         
         float spike = step(0.6, randVal) * randVal * uSpikeMax;
         
         activeStrength = uHoverState * (0.2 + spike);
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
