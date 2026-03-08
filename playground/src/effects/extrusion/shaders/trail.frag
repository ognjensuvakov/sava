uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec3 uMouse;
uniform float uFade;
uniform float uSize;

varying vec2 vUv;

void main() {
    // Sample previous frame
    vec4 data = texture2D(uTexture, vUv);
    
    // Decay
    float strength = data.r * uFade;

    // Mouse interaction
    if (uMouse.z > 0.0) {
        float dist = distance(vUv, uMouse.xy);
        // radius based on uSize, e.g. 0.05
        if (dist <= uSize) {
             strength += 1.0; 
        }
    }

    // Clamp
    strength = min(strength, 1.0);

    gl_FragColor = vec4(strength, 0.0, 0.0, 1.0);
}
