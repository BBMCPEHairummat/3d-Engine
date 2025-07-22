const canvas = document.getElementById('my_canvas');

canvas.addEventListener("click", () => {
  // canvas.requestFullscreen();
  canvas.requestPointerLock();
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.style.backgroundColor = 'black';

let createHouse;
let player;
window.onload = function() {
  const texture1 = loadTexture('Textures/brick.png');
  const texture2 = loadTexture('Textures/concrete.jpg');
  const texture3 = loadTexture('Textures/door.jpg');
  const texture4 = loadTexture('Textures/wall1.jpg');
  const texture5 = loadTexture('Textures/jinn.jpg');
  const texture6 = loadTexture('Textures/grass.jpg');
  const texture7 = loadTexture('Textures/wall2.jpg');

  player = {
    inventory: [],
    height: 1.7, width: 0.5, depth: 0.5,
    has: function (item) {
      return player.inventory.includes(item)
    },
    getHitbox: function() {
      return new Cube({
        x: camera.x / 2 - player.width / 4,
        y: camera.y / 2 + player.height / 4,
        z: camera.z / 2 - player.depth / 4
      }, player.width, player.height, player.depth, texture1)
    }
  }

  class Item {
    constructor (name) {
      this.name = name;
    }

    addToPlayer() {
      player.inventory.push(this)
    }
    removeFromPlayer() {
      player.inventory = player.inventory.filter(item => item !== this);
    }
  }
  createHouse = function(x, z, inverted = false) {
    let i = 1;
    if (inverted) { i = -1; }
    objects.push(new Cube({
      x: (-2 + 0.25 + x),
      y: -1,
      z: (1 + z)*i
    }, 1, 9, 1*i, texture1));
      
    objects.push(new Cube({
      x: (2 + 0.25 + x),
      y: -1,
      z: (1 + z)*i
    }, 1, 9, 1*i, texture1));
  
    objects.push(new Cube({
      x: (-3.5 + x), 
      y: -1, 
      z: (-7.5 + z)*i
    }, 15.5, 1, 19*i, texture2));
  
    objects.push(new Cube({
      x: (-3.5 + x),
      y: 3.5,
      z: (-7.5 + z)*i
    }, 15.5, 1, 19*i, texture4));
  
    const door = new Cube ({
      x: (-0.25 + x), 
      y: 0.5,
      z: (1 + z)*i
    }, 3, 6, 1*i, texture3);
    objects.push(door);

    const outer_layer = new Cube({
      x: (-3.5 + x), y: -0.5, z: (-7.5 + z)*i
    }, 15.5, 8, 17*i, texture7);
    objects.push(outer_layer);
  }

  for (let i = 0; i < 25; i++) { createHouse(-100 + (i * 10), camera.z / 2, true) }
  for (let i = 0; i < 25; i++) { createHouse(-100 + (i * 10), camera.z / 2 - 15, false) }

  objects.push(new Cube({
      x: -1000,
      y: 4,
      z: -1000
  }, 4000, 2, 4000, texture6));
  
  objects.forEach(object => object.static = false);

  window.addEventListener('click', function() {
    
  })

  function game_loop() {
    move_camera();
    const player_hitbox = player.getHitbox();
    const lp = player_hitbox.position;
    const light = new point_light(lp.map(pos => pos * 2), [1.0, 0.1, 0.12], 100.2);
    light.bind_gl();
    
    const solid_objects = objects.filter(object => !object.static)
    for (let i = 0; i < solid_objects.length; i++) {
      const overlap_result = solid_objects[i].getClosestOverlapAxis(player_hitbox);
      
      if (overlap_result.Lapping) {
        switch (overlap_result.axis) {
          case 'x' :
            camera.x += overlap_result.overlap;
            break;
          case 'y' :
            camera.y += overlap_result.overlap;
            break;
          case 'z' : 
            camera.z += overlap_result.overlap;
            break;
        }
      }
    }
    
    render();
    window.requestAnimationFrame(game_loop);
  }
  
  camera.x = 61.72270291567574;
  camera.y = 2.625; 
  camera.z = -12.434940767825449;
  game_loop();
}