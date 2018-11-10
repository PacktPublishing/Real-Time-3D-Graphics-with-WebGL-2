'use strict';

// Encapsulates common light functionality
class Light {

  constructor(id) {
    this.id = id;
    this.position = [0, 0, 0];

    // We could use the OBJ convention here (e.g. Ka, Kd, Ks, etc.),
    // but decided to use more prescriptive terms here to showcase
    // both versions
    this.ambient = [0, 0, 0, 0];
    this.diffuse = [0, 0, 0, 0];
    this.specular = [0, 0, 0, 0];
  }

  setPosition(position) {
    this.position = position.slice(0);
  }

  setDiffuse(diffuse) {
    this.diffuse = diffuse.slice(0);
  }

  setAmbient(ambient) {
    this.ambient = ambient.slice(0);
  }

  setSpecular(specular) {
    this.specular = specular.slice(0);
  }

  setProperty(property, value) {
    this[property] = value;
  }

}

// Helper class to maintain a collection of lights
class LightsManager {

  constructor() {
    this.list = [];
  }

  add(light) {
    if (!(light instanceof Light)) {
      console.error('The parameter is not a light');
      return;
    }
    this.list.push(light);
  }

  getArray(type) {
    return this.list.reduce((result, light) => {
      result = result.concat(light[type]);
      return result;
    }, []);
  }

  get(index) {
    if (typeof index === 'string') {
      return this.list.find(light => light.id === index);
    } else {
      return this.list[index];
    }
  }
}
