'use strict';

// Visualize the axis on the screen
class Axis {

  constructor(dimension = 10) {
    this.alias = 'axis';

    this.wireframe = true;
    this.indices = [0, 1, 2, 3, 4, 5];
    this.dimension = dimension;

    this.build(this.dimension)
  }

  build(dimension) {
    if (dimension) {
      this.dimension = dimension;
    }

    this.vertices = [
      -dimension, 0.0, 0.0,
      dimension, 0.0, 0.0,
      0.0, -dimension / 2, 0.0,
      0.0, dimension / 2, 0.0,
      0.0, 0.0, -dimension,
      0.0, 0.0, dimension
    ];
  }

}

