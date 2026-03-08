uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;
uniform vec3 uIdleColor;
uniform float uHoverState;

varying vec3 vColorMix; 
varying float vIntensity;

vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
    float strength = vColorMix.x;
    
    vec3 baseColor = palette(strength * 0.3 + vIntensity * 0.1, uColorA, uColorB, uColorC, uColorD);
    
    // Pixel "head" effect
    if (vColorMix.y > 0.5) {
        float whiteFactor = clamp(strength * 0.5, 0.0, 0.4); 
        baseColor = mix(baseColor, vec3(1.0), whiteFactor);
        baseColor *= (1.0 + strength * 0.2); 
    }
    
    // Mix towards idle color. We keep alpha at 1.0 so the idle color is fully visible.
    // If idleColor matches background, it's invisible. If they change it, they will see it.
    baseColor = mix(uIdleColor, baseColor, uHoverState);
    
    gl_FragColor = vec4(baseColor, 1.0);
}
