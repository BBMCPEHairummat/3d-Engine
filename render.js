const globalConfig = {
  clip_automatically: false
}

const gl = canvas.getContext('webgl');
const mat4 = glMatrix.mat4;

if (!gl) {
  alert('WebGL not supported');
}

const vsSource = `
attribute vec3 aPosition;
attribute vec2 aUV;
attribute vec3 aNormal;

uniform mat4 uMVP;
uniform mat4 uModel;

varying vec2 vUV;
varying vec3 vNormal;
varying vec3 vFragPos;

void main() {
  vec4 fragPos = uModel * vec4(aPosition, 1.0);
  gl_Position = uMVP * vec4(aPosition, 1.0);

  vUV = aUV;
  vFragPos = fragPos.xyz;
  vNormal = mat3(uModel) * aNormal;
}
`;

const fsSource = `
precision mediump float;

uniform sampler2D uTexture;

uniform vec3 uLightDir;
uniform vec3 uLightColor;
uniform vec3 uLightPos;
uniform vec3 uAmbientColor;
uniform float uLightPower;
uniform float uAmbientPower;

varying vec2 vUV;
varying vec3 vNormal;
varying vec3 vFragPos;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(uLightPos - vFragPos);

  float distance = length(uLightPos - vFragPos);
  float attenuation = 1.0 / (distance * distance);

  float diff = max(dot(normal, lightDir), 0.0);
  vec3 diffuse = diff * uLightColor * uLightPower * attenuation;

  vec3 ambient = uAmbientColor * uAmbientPower;

  vec3 lighting = ambient + diffuse;

  vec4 texColor = texture2D(uTexture, vUV);
  gl_FragColor = vec4(texColor.rgb * lighting, texColor.a);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  return program;
}

const program = createProgram(gl, vsSource, fsSource);
gl.useProgram(program);

const aPosition = gl.getAttribLocation(program, "aPosition");
const aUV = gl.getAttribLocation(program, "aUV");
const uMVP = gl.getUniformLocation(program, "uMVP");

const aNormal = gl.getAttribLocation(program, "aNormal");

const uModel = gl.getUniformLocation(program, "uModel");
const uLightDir = gl.getUniformLocation(program, "uLightDir");
const uLightColor = gl.getUniformLocation(program, "uLightColor");
const uAmbientColor = gl.getUniformLocation(program, "uAmbientColor");
const uLightPower = gl.getUniformLocation(program, "uLightPower");
const uAmbientPower = gl.getUniformLocation(program, "uAmbientPower");

// Cold bluish ambient light, dimmed
gl.uniform3fv(uAmbientColor, [0.1, 0.1, 0.2]); // Cold blue
gl.uniform1f(uAmbientPower, 1.25);             // Low intensity

// Weak, slightly yellowish directional light
gl.uniform3fv(uLightColor, [0.7, 0.6, 0.75]);  // Pale old light
gl.uniform3fv(uLightDir, [0.3, -1.0, -0.3]);  // Tilted light angle
gl.uniform1f(uLightPower, 10.5);               // Not too strong

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, camera.fov, canvas.width / canvas.height, camera.near, camera.far);
  const viewMatrix = getViewMatrix();

  for (let cube of objects) {
    if (globalConfig.clip_automatically === true || cube.shouldReclip == true) {
      cube = cube.reclip_self();
      if (cube.shouldReclip == true) cube.shouldReclip = false;
    }

    const modelMatrix = mat4.create();
    /* 
      When publishing engine for production use,
      make sure to replace below with this --> 
      mat4.translate(modelMatrix, modelMatrix, cube.position.map(a => a * 2));
    */
    mat4.translate(modelMatrix, modelMatrix, cube.position);
    
    mat4.rotateX(modelMatrix, modelMatrix, cube.rotation[0]);
    mat4.rotateY(modelMatrix, modelMatrix, cube.rotation[1]);
    mat4.rotateZ(modelMatrix, modelMatrix, cube.rotation[2]);

    const mvp = mat4.create();
    mat4.multiply(mvp, projectionMatrix, viewMatrix);
    mat4.multiply(mvp, mvp, modelMatrix);
    gl.uniformMatrix4fv(uMVP, false, mvp);

    gl.uniformMatrix4fv(uModel, false, modelMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, cube.normalBuffer);
    gl.enableVertexAttribArray(aNormal);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cube.vertexBuffer);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cube.uvBuffer);
    gl.enableVertexAttribArray(aUV);
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, cube.texture);
    gl.uniform1i(gl.getUniformLocation(program, 'uTexture'), 0);

    gl.drawArrays(gl.TRIANGLES, 0, cube.vertexCount);
  }
}