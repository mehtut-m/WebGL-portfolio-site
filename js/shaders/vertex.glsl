uniform float time;
uniform float uProgress;
uniform vec2 uQuadSize;
uniform vec4 uCorners;
uniform vec2 uResolution;

varying vec2 vSize;
varying vec2 vUv;

void main () {
    vUv = uv;
    vec4 defaultState = modelMatrix * vec4(position, 1.0) ;
    vec4 fullScreenState = vec4(position, 1.0);
    
    // Transition to Fullscreen
    fullScreenState.x *= uResolution.x / uQuadSize.x;
    fullScreenState.y *= uResolution.y / uQuadSize.y;

    float cornersProgress = mix(
        mix(uCorners.x, uCorners.w, uv.x),
        mix(uCorners.x, uCorners.y, uv.x),
        uv.y 
        );

    vec4 finalState = mix(defaultState, fullScreenState, cornersProgress);

    // mix(startingSize, endingSize, interpolation)
    vSize = mix(uQuadSize, uResolution, uProgress);

    // Model Matrix is responsible for shape moving on the screen without it the shape will bring it self back to the center
    gl_Position = projectionMatrix * viewMatrix * finalState;
;
}