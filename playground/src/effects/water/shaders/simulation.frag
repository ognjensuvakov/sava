uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec3 uMouse;
uniform int uFrame;
uniform float uDelta;
uniform float uDamping;
uniform float uPressureDamping;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    vec2 texel = 1.0 / uResolution;

    vec4 data = texture2D(uTexture, uv);
    float pressure = data.x;
    float pVel = data.y;

    // Neighbors
    float p_right = texture2D(uTexture, uv + vec2(texel.x, 0.0)).x;
    float p_left  = texture2D(uTexture, uv + vec2(-texel.x, 0.0)).x;
    float p_up    = texture2D(uTexture, uv + vec2(0.0, texel.y)).x;
    float p_down  = texture2D(uTexture, uv + vec2(0.0, -texel.y)).x;

    // Apply horizontal wave function
    pVel += uDelta * (-2.0 * pressure + p_right + p_left) / 4.0;
    // Apply vertical wave function
    pVel += uDelta * (-2.0 * pressure + p_up + p_down) / 4.0;

    // Change pressure by pressure velocity
    pressure += uDelta * pVel;

    // "Spring" motion
    pVel -= 0.005 * uDelta * pressure;

    // Velocity damping
    pVel *= 1.0 - uDamping * uDelta;

    // Pressure damping
    pressure *= uPressureDamping;

    // Mouse interaction
    if (uMouse.z > 0.0) {
        float dist = distance(uv, uMouse.xy);
        // radius 0.03 in UV space (approx 20px on 800px screen)
        if (dist <= 0.03) {
             pressure += 1.0 * (1.0 - dist / 0.03);
        }
    }

    gl_FragColor = vec4(pressure, pVel, (p_right - p_left) / 2.0, (p_up - p_down) / 2.0);
}
