'use strict';
class WebpackLoader {
  constructor(config) {
    this.config = config;
    this.loaders = [];
  }

  setLoader(loader) {
    this.loaders = this.loaders.concat(Array.isArray(loader) ? loader : [loader]);
  }

  addBefore(plugin, name) {
    const position = this.position(name);
    if (position > -1) {
      this.loaders.splice(position, 0, plugin);
    } else {
      this.loaders.push(plugin);
    }
  }

  addAfter(plugin, name) {
    const position = this.position(name);
    if (position > -1) {
      this.loaders.splice(position + 1, 0, plugin);
    } else {
      this.loaders.push(plugin);
    }
  }

  position(name) {
    return this.loaders.findIndex(loader => {
      return loader.name === name;
    });
  }

  remove(name) {
    const position = this.loaders.findIndex(item => {
      return item === name;
    });
    if (position > -1) {
      this.loaders.splice(position, 1);
    }
  }
}

module.exports = WebpackLoader;
