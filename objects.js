/* 
  Yo wsg twin
  my first time coding a 3d engine. ts object js
*/

class Cube {
  constructor(pos, width, height, depth, texture) {
    this.width = width;
    this.height = height;
    this.depth = depth;

    this.position = [pos.x, pos.y, pos.z];
    this.rotation = [0,0,0];
    this.texture = texture || default_texture; // No texture? twin js get sum
    
    this.shouldReclip = false;
    if (this.depth < 0) { // Really Negative? 
      // Lets just shift it back
      this.position[2] -= -this.depth / 4 + -this.depth / 4;
      this.depth = -this.depth;
      // Now we need a reclip self
      this.shouldReclip = true;
    }

    const x = pos.x, y = pos.y, z = pos.z;
    const w = width, h = height, d = depth;

    this.vertices = new Float32Array([
      x, y, z,               x + w, y, z,            x + w, y + h, z,
      x, y, z,               x + w, y + h, z,        x, y + h, z,

      x + w, y, z + d,       x, y, z + d,            x, y + h, z + d,
      x + w, y, z + d,       x, y + h, z + d,        x + w, y + h, z + d,

      x, y + h, z,           x + w, y + h, z,        x + w, y + h, z + d,
      x, y + h, z,           x + w, y + h, z + d,    x, y + h, z + d,

      x, y, z + d,           x + w, y, z + d,        x + w, y, z,
      x, y, z + d,           x + w, y, z,            x, y, z,

      x + w, y, z,           x + w, y, z + d,        x + w, y + h, z + d,
      x + w, y, z,           x + w, y + h, z + d,    x + w, y + h, z,

      x, y, z + d,           x, y, z,                x, y + h, z,
      x, y, z + d,           x, y + h, z,            x, y + h, z + d
    ]);

    this.uvs = new Float32Array([
      // Front
      0, 0, 1, 0, 1, 1,
      0, 0, 1, 1, 0, 1,
      // Back
      0, 0, 1, 0, 1, 1,
      0, 0, 1, 1, 0, 1,
      // Top
      0, 0, 1, 0, 1, 1,
      0, 0, 1, 1, 0, 1,
      // Bottom
      0, 0, 1, 0, 1, 1,
      0, 0, 1, 1, 0, 1,
      // Right
      0, 0, 1, 0, 1, 1,
      0, 0, 1, 1, 0, 1,
      // Left
      0, 0, 1, 0, 1, 1,
      0, 0, 1, 1, 0, 1,
    ]);

    this.uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);
    
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    this.vertexCount = this.vertices.length / 3;

    this.normals = new Float32Array([
      0,  0, -1,
      0,  0, -1,
      0,  0, -1,
      0,  0, -1,
      0,  0, -1,
      0,  0, -1,

      0,  0, 1,
      0,  0, 1,
      0,  0, 1,
      0,  0, 1,
      0,  0, 1,
      0,  0, 1,

      0,  1,  0,
      0,  1,  0,
      0,  1,  0,
      0,  1,  0,
      0,  1,  0,
      0,  1,  0,

      0, -1,  0,
      0, -1,  0,
      0, -1,  0,
      0, -1,  0,
      0, -1,  0,
      0, -1,  0,

      1,  0,  0,
      1,  0,  0,
      1,  0,  0,
      1,  0,  0,
      1,  0,  0,
      1,  0,  0,

      -1,  0,  0,
      -1,  0,  0,
      -1,  0,  0,
      -1,  0,  0,
      -1,  0,  0,
      -1,  0,  0,
    ]);

    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
  }
  getDistanceTo(position) {
    let dx = this.position[0] - position[0];
    let dy = this.position[1] - position[1];
    let dz = this.position[2] - position[2];
    
    return dx*dx + dy*dy + dz*dz;
  }
  checkCollision(other) {
    return this.getClosestOverlapAxis(other).Lapping;
  }
  getClosestOverlapAxis(other) {
    const a = this, b = other;

    let ax = a.position[0], ay = a.position[1], az = a.position[2];
    let bx = b.position[0], by = b.position[1], bz = b.position[2];

    let aw = a.width, ah = a.height, ad = a.depth;
    let bw = b.width, bh = b.height, bd = b.depth;

    /* Some* great humans sometimes decide to 
       give negative integers for their objects. */
    // That is not good

    /*
      I have already added the fix but if that still
      doesnt work then just hope this will...
    */

    // So lets just check if the values are negative
    // Then make it positive
    // After update the position by their negative values
    // This would surely work
    
    // Lets Experiment with Z axis
    if (ad < 0) { // Check Negative
      ad = -ad; // Reverse Sign
      az -= ad / 4 + ad / 4; // Move the object backwards(for now)
    }
    // Les do same for every values
    if (bd < 0) {
      bd = -bd;
      bz += bd / 4 + bd / 4; 
    }
    // Nah i dont feel like, maybe later

    const dx1 = (ax + aw / 2) - bx;
    const dx2 = (bx + bw / 2) - ax;
    const overlapX = dx1 > 0 && dx2 > 0 ? Math.min(dx1,dx2) : 0;

    const dy1 = (ay + ah) - by;
    const dy2 = (by + bh) - ay;
    const overlapY = dy1 > 0 && dy2 > 0 ? Math.min(dy1,dy2) : 0;
    
    const dz1 = (az + ad / 2) - bz;
    const dz2 = (bz + bd / 2) - az;
    const overlapZ = dz1 > 0 && dz2 > 0 ? Math.min(dz1,dz2) : 0;

    if (overlapX + overlapY + overlapZ > 0) {
      const min = Math.min(overlapX, overlapY, overlapZ);
      switch (min) {
        case overlapX:
          return {
            axis: 'x',
            overlap: overlapX * (ax < bx ? 1 : -1),
            Lapping: true
          }
        case overlapY:
          return {
            axis: 'y',
            overlap: overlapY * (ay < by ? 1 : -1),
            Lapping: true
          }
        case overlapZ: 
          return {
            axis: 'z',
            overlap: overlapZ * (az < bz ? 1 : -1),
            Lapping: true
          }
      }
    }
    
    // No change & Quick Error Handling
    return {
      axis: 'x', overlap: 0, Lapping: false
    }
  }
  reclip_self() {
    /*
      Fix Collision Hitbox
      Not recommended tho
   */
    // First Remove itself from being an object globally
    objects = objects.filter(object => object !== this);
    // Create a new dummy object
    const reclipped_self = new Cube({
      x: this.position[0],
      y: this.position[1],
      z: this.position[2]
    }, this.width, this.height, this.depth, this.texture);
    // Handle all the properties of self to the dummy one
    // But with some exceptions
    const exception_properties = ['position', 'width', 'height', 'depth', 
                                  'texture', 'uvs', 'vertexBuffer', 'uvBuffer',
                                  'vertices', 'vertexCount'
    ];
    // We do this so that new values dont get replaced by old ones
    const properties = Object.keys(this).filter(property => !exception_properties.includes(property));
    for (const property of properties) {
      reclipped_self[property] = this[property];
    }
    // Declare the new object globally
    objects.push(reclipped_self);
    // Return the new object for better
    return objects[objects.length - 1];
  }
}

class point_light {
  constructor (position, color, power) {
    this.position = position;
    this.color = color;
    this.power = power;
  }
  bind_gl() {
    gl.uniform3fv(gl.getUniformLocation(program, "uLightPos"), this.position);
    gl.uniform3fv(gl.getUniformLocation(program, "uLightColor"), this.color);
    gl.uniform1f(gl.getUniformLocation(program, "uLightPower"), this.power);
  }
}

function loadTexture(url) {
  const texture = gl.createTexture();
  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    if ((image.width & (image.width - 1)) === 0 && (image.height & (image.height - 1)) === 0) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;
  return texture;
}

const default_texture = loadTexture('default_texture.jpg');

var objects = [];