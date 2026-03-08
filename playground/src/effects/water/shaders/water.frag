uniform sampler2D uSimulation;
uniform vec3 uColor;
uniform vec3 uHighlight;
uniform float uOpacity;
uniform vec3 uLightPos;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;

void main() {
     vec4 data = texture2D(uSimulation, vUv);
     
     // Gradients: data.z = dH/dX, data.w = dH/dY
     // Adjust normal scaling for visual impact
     vec3 normal = normalize(vec3(-data.z * 5.0, -data.w * 5.0, 1.0));
     
     vec3 viewDir = normalize(vViewPosition); 
     vec3 lightDir = normalize(uLightPos - vWorldPosition); // Use uniform
     vec3 halfVec = normalize(lightDir + viewDir);
     
     float spec = pow(max(dot(normal, halfVec), 0.0), 100.0);
     float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.0);

     // Mix base color with highlight based on light/fresnel
     vec3 color = mix(uColor, uHighlight, fresnel * 0.5);
     color += vec3(spec);
     
     gl_FragColor = vec4(color, uOpacity); 
}
