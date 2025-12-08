varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;

uniform sampler2D uSimulation;

void main() {
    vUv = uv;
    
    vec4 data = texture2D(uSimulation, uv);
    float height = data.x * 0.2; 
    
    vec3 pos = position;
    pos.z += height; 
    
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    vec4 viewPosition = viewMatrix * worldPosition;
    vViewPosition = -viewPosition.xyz;
    
    gl_Position = projectionMatrix * viewPosition;
}
