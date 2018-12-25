
// ВЕРШ ШЕЙДЕР
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' + 
  'attribute vec4 a_Color;\n' + 
  'attribute vec4 a_Normal;\n' +        // Normal
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform vec3 u_LC;\n' +     // Light color
  'uniform vec3 u_LD;\n' + // Light direction (in the world coordinate, normalized)
  'uniform vec3 u_AL;\n' + 
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  // Make the length of the normal 1.0
  '  vec3 normal = normalize(a_Normal.xyz);\n' +
  // Dot product of the light direction and the orientation of a surface (the normal)
  '  float nDotL = max(dot(u_LD, normal), 0.0);\n' +
  // Calculate the color due to diffuse reflection
  '  vec3 amb = u_AL * a_Color.rgb;\n' + 
  '  vec3 diffuse = u_LC * a_Color.rgb * nDotL;\n' +
  '  v_Color = vec4(diffuse+amb, a_Color.a);\n' +
  '}\n';

// ФРАГМ ШЕЙДЕР
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

function main() {
  // 
  var canvas = document.getElementById('webgl');

  // 
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // 
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // 
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // 
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.enable(gl.DEPTH_TEST);

  // 
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) { 
    console.log('Failed to get the storage location of u_MvpMatrix');
    return;
  }

  // ТОЧКА И НАПРАВЛЕНИЕ ВЗГЛЯДА
  let mvpMatrix = mat4.create();
  let m         = mat4.create();
  // настройка перспективы
  mat4.perspective(m, 1.5, 1, 1, 0);
  // настройка взгляда на объект
  mat4.lookAt(mvpMatrix, [2, 2, 2],
                         [1, 1, 1],
                         [3, 3, 4]);
  mat4.multiply(mvpMatrix, m, mvpMatrix);
  var u_AL =  gl.getUniformLocation(gl.program, 'u_AL');
  var u_LC =  gl.getUniformLocation(gl.program, 'u_LC');
  var u_LD =  gl.getUniformLocation(gl.program, 'u_LD');
  gl.uniform3f(u_LC, 1.0,1.0,1.0);
  var LD = vec3.create();
  // положение источника света
  vec3.normalize(LD, [1.0,1.0,1.0]);
  // спектр света
  gl.uniform3fv(u_AL, [0.4,0.4,0.4]);
  gl.uniform3fv(u_LD, LD);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix);
   
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl) {

    // координаты
    var vertices = new Float32Array([
    // v0               v1               v2               v3             front side
       1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,
    // v0               v3               v4               v5             right side
       1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, 
    // v0               v5               v6               v1             upper side
       1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, 
    // v1               v6               v7               v2             left side
      -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,
    // v7               v4               v3               v2             down side
      -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, 
    // v4               v7               v6               v5             back side
       1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0 
    ]);

    // RGB cube color
    var colors = new Float32Array([
    //v0         v1         v2        v3       front side
      1, 1, 1,   0, 1, 1,   0, 0, 1,  1, 0, 1,
    //v0         v3         v4        v5       right side
      1, 1, 1,   1, 0, 1,   1, 0, 0,  1, 1, 0,
    //v0         v5         v6        v1       upper side
      1, 1, 1,   1, 1, 0,   0, 1, 0,  0, 1, 1, 
    //v1         v6         v7        v2       left side
      1, 0, 0,   0, 1, 0,   1, 1, 1,  0, 0, 1,  
    //v7         v4         v3        v2       down side
      1, 1, 1,   1, 0, 0,   1, 0, 1,  0, 0, 1,   
    //v4         v7         v6        v5       back side
      1, 0, 0,   1, 1, 1,   0, 1, 0,  1, 1, 0　   
    ]);


    var normals = new Float32Array([
    //v0               v1               v2               v3             front side
      0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0, 
    //v0               v3               v4               v5             right side
      1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,
    //v0               v5               v6               v1             upper side
      0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
    //v1               v6               v7               v2             left side
     -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  
    //v7               v4               v3               v2             down side
      0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  
    //v4               v7               v6               v5             back side
      0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0  
    ]);


    // Indices of the vertices
    var indices = new Uint8Array([
       0, 1, 2,   0, 2, 3,    // front
       4, 5, 6,   4, 6, 7,    // right
       8, 9,10,   8,10,11,    // up
      12,13,14,  12,14,15,    // left
      16,17,18,  16,18,19,    // down
      20,21,22,  20,22,23     // back
    ]);


    // Write the vertex property to buffers (coordinates, colors and normals)
    if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT) ||
        !initArrayBuffer(gl, 'a_Color',    colors, 3, gl.FLOAT)   ||
        !initArrayBuffer(gl, 'a_Normal',   normals, 3, gl.FLOAT)) {return -1;}

    // Write the indices to the buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return false;
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer (gl, attribute, data, num, type) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return true;
}
