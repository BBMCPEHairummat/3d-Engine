const camera = {
  x: 0, y: 0, z: 0,
  rotX: 0, rotY: 0, rotZ: 0,
  fov: 300, speed: 0.35, sensitivity: 0.002,
  near: 0.1,
  far: 1000000,
}

let keys = {}
window.addEventListener('keydown', function(e) {
  keys[e.key.toLowerCase()] = true
})
window.addEventListener('keyup', function(e) {
  keys[e.key.toLowerCase()] = false
})

function move_camera () {
  if (keys['w']) {
    camera.x += Math.sin(camera.rotY) * camera.speed;
    camera.z -= Math.cos(camera.rotY) * camera.speed;
  }
  if (keys['s']) {
    camera.x -= Math.sin(camera.rotY) * camera.speed;
    camera.z += Math.cos(camera.rotY) * camera.speed;
  }
  if (keys['a']) {
    camera.x += Math.cos(camera.rotY) * camera.speed;
    camera.z += Math.sin(camera.rotY) * camera.speed;
  }
  if (keys['d']) {
    camera.x -= Math.cos(camera.rotY) * camera.speed;
    camera.z -= Math.sin(camera.rotY) * camera.speed;
  }

  if (keys[' ']) camera.y -= camera.speed;
  if (keys['shift']) camera.y += camera.speed;
}

window.addEventListener('mousemove', function(e) {
  camera.rotY -= e.movementX * camera.sensitivity * 1.5;
  camera.rotX -= e.movementY * camera.sensitivity * 0.75;
  camera.rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotX))
})

function getViewMatrix () {
  const viewMatrix = glMatrix.mat4.create();
  glMatrix.mat4.rotateX(viewMatrix, viewMatrix, camera.rotX);
  glMatrix.mat4.rotateY(viewMatrix, viewMatrix, camera.rotY);
  glMatrix.mat4.translate(viewMatrix, viewMatrix, [-camera.x, -camera.y, -camera.z]);
  return viewMatrix;
}