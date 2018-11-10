'use strict';
const WebpackBasePlugin = require('../base/plugin');
class WebpackPlugin extends WebpackBasePlugin {
  create() {
    return this.loaders.map(label => {
      return this[label].call(this);
    });
  }

  enable(label, position) {
    if (this.plugins.includes[label]) {
      console.warn('loader had registed');
      return;
    }
    this.plugins.push(label);
    return this;
  }

  disable(label) {
    const index = this.plugins.findIndex(name => {
      return label === name;
    });
    if (index > -1) {
      this.plugins.splice(index, 1);
    }
    return this;
  }
}