varying vec3 vColor;
varying float vHeight;

uniform vec3 uColorHead;
uniform vec3 uColorTail;

void main() {
    // vColor already has basic separation from vertex shader (top vs body)
    
    // Maybe modulate brightness by height
    float brightness = 0.2 + vHeight * 2.0;
    
    // Use the color passed from vertex
    vec3 finalColor = vColor;
    
    // If it is the trail color (body), maybe fade it?
    // Let's rely on the vertex mix.
    // If it's the head (top), we want it super bright if height is high.
    
    gl_FragColor = vec4(finalColor * brightness, 1.0);
}
