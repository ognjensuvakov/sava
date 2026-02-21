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
    
    vec3 baseColor = palette(strength * 0.5 + vIntensity * 0.2, uColorA, uColorB, uColorC, uColorD);
    
    if (vColorMix.y > 0.5) {
        baseColor = mix(baseColor, vec3(1.0), 0.5) * 1.5;
    }
    
    float alpha = max(0.1, strength * 3.0); 
    baseColor *= alpha;
    
    gl_FragColor = vec4(baseColor, 1.0);
}
