import { vec3, scale, add, flatten, mix } from './MV.js';
import { initShaders } from './initShaders.js';
import WebGLUtils from './webgl-utils.js';

const vertexShader = `
attribute vec3 vPosition;
attribute vec3 vColor;
varying vec4 fColor;

void main()
{
  fColor = vec4(vColor, 1.0);
  gl_Position = vec4(vPosition, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

varying vec4 fColor;

void main()
{
  gl_FragColor = fColor;
}
`;

const canvas = document.getElementById('ican');
const gl = WebGLUtils.setupWebGL(canvas);
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.9, 0.9, 0.9, 1.0);
gl.enable(gl.DEPTH_TEST);



const baseColors = [
  vec3(0.5, 0.0, 0.0),
  vec3(0.0, 0.5, 0.0),
  vec3(0.0, 0.0, 0.5),
  vec3(0.0, 0.0, 0.0),
];

const vertices2 = [
 vec3(  0.0000,  0.0000, -1.0000 ),
 vec3(  0.0000,  0.9428,  0.3333 ),
 vec3( -0.8165, -0.4714,  0.3333 ),
 vec3(  0.8165, -0.4714,  0.3333 )
];

const points = [ ];
const colors = [ ];

const pushTriangle = (a, b, c, color) => {
  colors.push(baseColors[color]);
  points.push(a);
  colors.push(baseColors[color]);
  points.push(b);
  colors.push(baseColors[color]);
  points.push(c);
}

const pushTetrahydron = (a, b, c, d) => {
  pushTriangle(a, c, b, 0);
  pushTriangle(a, c, d, 1);
  pushTriangle(a, b, d, 2);
  pushTriangle(b, c, d, 3);
}

const divTetra = (a, b, c, d, count) => {
  if (count == 0) {
    pushTetrahydron(a, b, c, d);
  } else {

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var ad = mix( a, d, 0.5 );
        var bc = mix( b, c, 0.5 );
        var bd = mix( b, d, 0.5 );
        var cd = mix( c, d, 0.5 );

        --count;

        divTetra(  a, ab, ac, ad, count );
        divTetra( ab,  b, bc, bd, count );
        divTetra( ac, bc,  c, cd, count );
        divTetra( ad, bd, cd,  d, count );
    /*
    const countP = count - 1;
    const ab = mix(a, b, 0.5);
    const ac = mix(a, c, 0.5);
    const ad = mix(a, d, 0.5);
    const bc = mix(b, c, 0.5);
    const bd = mix(b, d, 0.5);
    const cd = mix(c, d, 0.5);

    divTetra(a, ab, ac, ad, countP);
    divTetra(ab, b, bc, bd, countP);
    divTetra(ac, bc, c, bd, countP);


    divTetra(ad, bd, cd, d, countP);
    */
  }
}



divTetra(vertices2[0], vertices2[1], vertices2[2], vertices2[3], 8);

const program = initShaders(gl, vertexShader, fragmentShader);

const cBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

const vColor = gl.getAttribLocation(program, "vColor");
gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vColor);

const vBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

const vPosition = gl.getAttribLocation(program, "vPosition");
gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vPosition);

gl.useProgram(program);

console.log(points);

console.log('boo');
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, points.length);
