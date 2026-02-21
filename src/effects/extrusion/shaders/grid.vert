uniform sampler2D uTrail;
uniform float uHeightScale;
uniform vec3 uColorHead;
uniform vec3 uColorTail;

varying vec3 vColor;
varying float vHeight;
varying vec2 vUv;

void main() {
    vUv = uv;
    
    // 1. Get world position of this instance
    // instanceMatrix is automatically available in ShaderMaterial when used with InstancedMesh if we don't override standard attributes, 
    // BUT for raw ShaderMaterial we generally need to assume Three.js populates instanceMatrix attribute.
    vec3 iPos = instanceMatrix[3].xyz; 
    
    // 2. Map iPos.xz to UV [0,1]. assume grid is 20x20 centered at 0
    vec2 mapUv = (iPos.xz / 20.0) + 0.5;
    
    // 3. Sample trail
    float trail = texture2D(uTrail, mapUv).r;
    
    // 4. Calculate Height
    float h = trail * uHeightScale;
    
    // Stretch logic
    vec3 updatedPos = position;
    float stretch = 1.0 + h * 2.0; // Base height + trail (reduced multiplier)
    
    // Apply stretch relative to bottom (-0.5)
    updatedPos.y = (updatedPos.y + 0.5) * stretch - 0.5;
    
    vec3 worldPos = iPos + updatedPos; 
    
    gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
    
    // Color logic
    vHeight = trail;
    vColor = mix(uColorTail, uColorHead, step(0.4, position.y)); 
}
