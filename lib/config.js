'use strict';
const merge = require('webpack-merge');

class WebpackConfig {
  constructor(webpackOption, webpackLoader, webpackPlugin) {
    this.webpackOption = webpackOption;
    this.webpackLoader = webpackLoader;
    this.webpackPlugin = webpackPlugin;
  }

  create() {
    return merge({
      module: {
        rules: this.webpackLoader.loaders
      },
      plugins: this.webpackPlugin.plugins
    }, this.webpackOption.options);
  }
}

module.exports = WebpackConfig;
