uniform sampler2D uTrail;
uniform float uTime;
uniform float uThreshold;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;

varying vec2 vUv;

// Cosine based palette, 4 vec3 params
vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
    vec2 uv = vUv;
    
    // Read trail
    float trail = texture2D(uTrail, uv).r;
    
    // Pixel Sorting / Glitch Logic
    // 1. Quantize X to create columns
    float columns = 50.0;
    float quantizedX = floor(uv.x * columns) / columns;
    
    // Sample trail at quantized X to see if this column is active
    float colTrail = texture2D(uTrail, vec2(quantizedX, uv.y)).r;
    
    // 2. Displace Y based on trail intensity
    // The more intense the trail, the more we "sort" (shift) pixels up
    if (colTrail > uThreshold) {
        // Shift speed
        float shift = colTrail * 0.5; 
        
        // Sorting direction (up)
        uv.y -= shift * sin(uTime * 2.0 + quantizedX * 10.0) * 0.1;
    }
    
    // 3. Color Generation
    // Use the displaced UVs and Time to pick a color from the palette
    // Vector 3 palette parameters from user request:
    // a: [0.543 0.030 0.563]
    // b: [0.827 0.907 0.754]
    // c: [1.054 1.394 1.047]
    // d: [1.707 1.572 5.885]
    
    // Using simple pattern for t
    float t = length(uv) + colTrail + uTime * 0.2;
    
    // If not affected by trail, maybe just black or subtle grid
    vec3 col = vec3(0.0);
    
    if (colTrail > 0.01) {
        col = palette(t, uColorA, uColorB, uColorC, uColorD);
        
        // Add some "scanline" style noise
        float scanline = sin(uv.y * 200.0) * 0.1;
        col += scanline;
    }
    
    // Fade out edges of the trail
    col *= colTrail;

    gl_FragColor = vec4(col, 1.0);
}
