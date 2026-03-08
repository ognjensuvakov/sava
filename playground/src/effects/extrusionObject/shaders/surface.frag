uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;

varying vec3 vColorMix; // x: activeStrength, y: 1.0 if top/head
varying float vIntensity;

// Cosine based palette, 4 vec3 params
vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
    float strength = vColorMix.x;
    
    // Add tiny height offset
    vec3 baseColor = palette(strength * 0.5 + vIntensity * 0.2, uColorA, uColorB, uColorC, uColorD);
    
    // Pixel "head" effect
    if (vColorMix.y > 0.5) {
        baseColor = mix(baseColor, vec3(1.0), 0.3) * 1.5;
    }
    
    // Fade background to black if not interacted with
    float alpha = max(0.1, strength * 2.0); 
    baseColor *= alpha;
    
    gl_FragColor = vec4(baseColor, 1.0);
}
