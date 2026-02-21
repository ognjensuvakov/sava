uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;

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
    
    // Alpha/Fade - more linear and less "sticky" at the bottom
    float alpha = clamp(strength * 2.0 + 0.05, 0.0, 1.0);
    baseColor *= alpha;
    
    gl_FragColor = vec4(baseColor, 1.0);
}
