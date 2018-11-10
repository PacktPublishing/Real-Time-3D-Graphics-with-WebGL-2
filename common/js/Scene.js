'use strict';

// Manages objects in a 3D scene
class Scene {

  constructor(gl, program) {
    this.gl = gl;
    this.program = program;

    this.objects = [];
  }

  // Find the item with given alias
  get(alias) {
    return this.objects.find(object => object.alias === alias);
  }

  // Asynchronously load a file
  load(filename, alias, attributes) {
    return fetch(filename)
    .then(res => res.json())
    .then(object => {
      object.visible = true;
      object.alias = alias || object.alias;
      this.add(object, attributes);
    })
    .catch((err) => console.error(err, ...arguments));
  }

  // Helper function for returning as list of items for a given model
  loadByParts(path, count, alias) {
    for (let i = 1; i <= count; i++) {
      const part = `${path}${i}.json`;
      this.load(part, alias);
    }
  }

  // Add object to scene, by settings default and configuring all necessary
  // buffers and textures
  add(object, attributes) {
    const { gl, program } = this;

    // Since we've used both the OBJ convention here (e.g. Ka, Kd, Ks, etc.)
    // and descriptive terms throughout the book for educational purposes, we will set defaults for
    // each that doesn't exist to ensure the entire series of demos work.
    // That being said, it's best to stick to one convention throughout your application.
    object.diffuse = object.diffuse || [1, 1, 1, 1];
    object.Kd = object.Kd || object.diffuse.slice(0, 3);

    object.ambient = object.ambient || [0.2, 0.2, 0.2, 1];
    object.Ka = object.Ka || object.ambient.slice(0, 3);

    object.specular = object.specular || [1, 1, 1, 1];
    object.Ks = object.Ks || object.specular.slice(0, 3);

    object.specularExponent = object.specularExponent || 0;
    object.Ns = object.Ns || object.specularExponent;

    object.d = object.d || 1;
    object.transparency = object.transparency || object.d;

    object.illum = object.illum || 1;

    // Merge if any attributes are provided
    Object.assign(object, attributes);

    // Indices
    object.ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.indices), gl.STATIC_DRAW);

    // Attach a new VAO instance
    object.vao = gl.createVertexArray();

    // Enable it to start working on it
    gl.bindVertexArray(object.vao);

    // Positions
    if (program.aVertexPosition >= 0) {
      const vertexBufferObject = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.vertices), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(program.aVertexPosition);
      gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    }

    // Normals
    if (program.aVertexNormal >= 0) {
      const normalBufferObject = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObject);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(
        utils.calculateNormals(object.vertices, object.indices)),
        gl.STATIC_DRAW
      );
      gl.enableVertexAttribArray(program.aVertexNormal);
      gl.vertexAttribPointer(program.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
    }

    // Color Scalars
    if (object.scalars && program.aVertexColor >= 0) {
      const colorBufferObject = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferObject);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.scalars), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(program.aVertexColor);
      gl.vertexAttribPointer(program.aVertexColor, 4, gl.FLOAT, false, 0, 0);
    }

    // Textures coordinates
    if (object.textureCoords && program.aVertexTextureCoords >= 0) {
      const textureBufferObject = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, textureBufferObject);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.textureCoords), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(program.aVertexTextureCoords);
      gl.vertexAttribPointer(program.aVertexTextureCoords, 2, gl.FLOAT, false, 0, 0);

      // Tangents
      if (program.aVertexTangent >= 0) {
        const tangentBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tangentBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(
          utils.calculateTangents(object.vertices, object.textureCoords, object.indices)),
          gl.STATIC_DRAW
        );
        gl.enableVertexAttribArray(program.aVertexTangent);
        gl.vertexAttribPointer(program.aVertexTangent, 3, gl.FLOAT, false, 0, 0);
      }
    }

    // Image texture
    if (object.image) {
      object.texture = new Texture(gl, object.image);
    }

    // Push to our objects list for later access
    this.objects.push(object);

    // Clean up
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  // Traverses over every item in the scene
  traverse(cb) {
    for(let i = 0; i < this.objects.length; i++) {
      // Break out of the loop as long as any value is returned
      if (cb(this.objects[i], i) !== undefined) break;
    }
  }

  // Removes an item from the scene with a given alias
  remove(alias) {
    const object = this.get(alias);
    const index = this.objects.indexOf(object);
    this.objects.splice(index, 1);
  }

  // Renders an item first
  renderFirst(alias) {
    const object = this.get(alias);
    const index = this.objects.indexOf(object);
    if (index === 0) return;

    this.objects.splice(index, 1);
    this.objects.splice(0, 0, object);
    this.printRenderOrder();
  }

  // Renders an item last
  renderLast(alias) {
    const object = this.get(alias);
    const index = this.objects.indexOf(object);
    if (index === 0) return;

    this.objects.splice(index, 1);
    this.objects.push(object);
    this.printRenderOrder();
  }

  // Pushes an item up the render priority
  renderSooner(alias) {
    const object = this.get(alias);
    const index = this.objects.indexOf(object);
    if (index === 0) return;

    this.objects.splice(index, 1);
    this.objects.splice(index - 1, 0, object);
    this.printRenderOrder();
  }

  // Pushes an item down the render priority
  renderLater(alias) {
    const object = this.get(alias);
    const index = this.objects.indexOf(object);
    if (index === this.objects.length - 1) return;

    this.objects.splice(index, 1);
    this.objects.splice(index + 1, 0, object);
    this.printRenderOrder();
  }

  // Construct and print a string representing the render order (useful for debugging)
  printRenderOrder() {
    const renderOrder = this.objects.map(object => object.alias).join(' > ');
    console.info('Render Order:', renderOrder);
  }

}