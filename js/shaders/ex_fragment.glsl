uniform float time; 
uniform sampler2D uTexture;

varying float pulse;
varying vec2 vUv;
varying vec3 vNormal;
void main () {

    // gl_FragColor = vec4(0.,0.,1.,1.);
    // Import texture
    vec4 myImage = texture(uTexture, vUv + 0.01 * sin(vUv*20. + time));

    float sinePulse = ((1. + sin(vUv.x * 50. + time)) * 0.5);

    // allowing color to be different as top left vUv = > 0, 1  == green
    // allowing color to be different as top right vUv = > 1, 1 == yellow
    // allowing color to be different as bottom left vUv = > 0, 0 == black
    // allowing color to be different as bottom left right = > 1,, 0 == red
    gl_FragColor = vec4(vUv,0.,1.);
    gl_FragColor = vec4(sinePulse, 0.,0., 1.);
    gl_FragColor = myImage;
    gl_FragColor = vec4((pulse),0.,0., 1.);
}   