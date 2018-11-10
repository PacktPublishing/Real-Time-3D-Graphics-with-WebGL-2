'use strict';

// Encapsulates common transformations in a 3D scene
class Transforms {

  constructor(gl, program, camera, canvas) {
    this.stack = [];

    this.gl = gl;
    this.program = program;
    this.camera = camera;
    this.canvas = canvas;

    this.modelViewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();
    this.normalMatrix = mat4.create();

    this.calculateModelView();
    this.updatePerspective();
    this.calculateNormal();
  }

  // Calculates the Model-View matrix
  calculateModelView() {
    this.modelViewMatrix = this.camera.getViewTransform();
  }

  // Calculates the Normal matrix
  calculateNormal() {
    mat4.copy(this.normalMatrix, this.modelViewMatrix);
    mat4.invert(this.normalMatrix, this.normalMatrix);
    mat4.transpose(this.normalMatrix, this.normalMatrix);
  }

  // Updates perspective
  updatePerspective() {
    mat4.perspective(
      this.projectionMatrix,
      this.camera.fov,
      this.canvas.width / this.canvas.height,
      this.camera.minZ,
      this.camera.maxZ
    );
  }

  // Sets all matrix uniforms
  setMatrixUniforms() {
    this.calculateNormal();
    this.gl.uniformMatrix4fv(this.program.uModelViewMatrix, false, this.modelViewMatrix);
    this.gl.uniformMatrix4fv(this.program.uProjectionMatrix, false, this.projectionMatrix);
    this.gl.uniformMatrix4fv(this.program.uNormalMatrix, false, this.normalMatrix);
  }

  // Pushes matrix onto the stack
  push() {
    const matrix = mat4.create();
    mat4.copy(matrix, this.modelViewMatrix);
    this.stack.push(matrix);
  }

  // Pops and returns matrix off the stack
  pop() {
    return this.stack.length
      ? this.modelViewMatrix = this.stack.pop()
      : null;
  }
}