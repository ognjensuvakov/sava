uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;
uniform vec3 uIdleColor;

varying vec3 vColorMix; 
varying float vIntensity;

vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
    float strength = vColorMix.x;

    // Smooth the palette input to linger on colors more
    vec3 baseColor = palette(strength * 0.3 + vIntensity * 0.1, uColorA, uColorB, uColorC, uColorD);

    // Pixel "head" effect - make it more subtle and dependent on intensity
    if (vColorMix.y > 0.5) {
        // Only add white if the needle is actually high/active
        float whiteFactor = clamp(strength * 0.5, 0.0, 0.4);
        baseColor = mix(baseColor, vec3(1.0), whiteFactor);
        baseColor *= (1.0 + strength * 0.2); // Subtle boost instead of flat 1.5x
    }

    // Interpolate between fully idle color and active colored strength
    // strength acts identically to uHoverState in terms of activation mask
    float activeMask = clamp(strength * 3.0, 0.0, 1.0);
    baseColor = mix(uIdleColor, baseColor, activeMask);

    // If it's idle, alpha = 1 (to keep silhouette blocky).
    // If it's active, alpha is also 1.
    gl_FragColor = vec4(baseColor, 1.0);
}
