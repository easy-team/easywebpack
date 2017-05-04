'use strict';
const merge = require('webpack-merge');

class WebpackPlugin {
  constructor(config) {
    this.plugins = [];
  }


  setPlugin(plugin) {
    this.plugins = this.plugins.concat(plugin);
  }

  addBefore(plugin, name) {
    const position = this.position(name);
    if (position > -1) {
      this.plugins.splice(position, 0, plugin);
    } else {
      this.plugins.push(plugin);
    }
  }

  addAfter(plugin, name) {
    const position = this.position(name);
    if (position > -1) {
      this.plugins.splice(position + 1, 0, plugin);
    } else {
      this.plugins.push(plugin);
    }
  }

  position(name) {
    return this.plugins.findIndex(plugin => {
      return plugin.constructor && plugin.constructor.name === name;
    });
  }

  remove(name) {
    const position = this.position(name);
    if (position > -1) {
      this.plugins.splice(position, 1);
    }
  }

  update(name, params) {
    const plugins = this.plugins.filter(plugin => {
      return plugin.name === name;
    });
    plugins.forEach(plugin => {
      const newPlugin = plugin.create(params);
      const positon = this.position(name);
      this.plugins.splice(positon, 1, newPlugin);
    });
  }
}

module.exports = WebpackPlugin;
