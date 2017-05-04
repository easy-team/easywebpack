'use strict';
const merge = require('webpack-merge');
const ConfigOption = require('../config/option');
const ConfigPlugin = require('../config/plugin');
const ConfigLoader = require('../config/loader');
const WebpackOption = require('./option');
const WebpackLoader = require('./loader');
const WebpackPlugin = require('./plugin');

class WebpackBuilder {
  constructor(config, options) {
    this.config = merge(config, { env: process.env.BUILD_ENV }, options);
    this.configOption = new ConfigOption(this.config);
    this.configLoader = new ConfigLoader(this.config);
    this.configPlugin = new ConfigPlugin(this.config);
    this.webpackOption = new WebpackOption(this.config);
    this.webpackLoader = new WebpackLoader(this.config);
    this.webpackPlugin = new WebpackPlugin(this.config);
  }

  useHash(isHash, len) {
    this.configOption.setFileNameHash(isHash, len);
    this.configLoader.setImageCssHash(isHash, len);
    this.configPlugin.setImageCssHash(isHash, len);
  }

  useCompress(isCompress) {

  }

  setConfigLoader(configLoaders) {
    this.configLoader.configLoaders = this.configLoader.configLoaders.concat(configLoaders);
  }

  setConfigPlugin(configPlugins) {
    this.configPlugin.configPlugins = this.configPlugin.configPlugins.concat(configPlugins);
  }

  setOption(options) {
    this.webpackOption.setOption(options);
  }

  setLoader(loaders) {
    this.webpackLoader.setLoader(loaders);
  }

  setPlugin(plugins) {
    this.webpackPlugin.setPlugin(plugins);
  }

  create() {
    return merge({
      module: {
        rules: this.configLoader.getWebpackLoader().concat(this.webpackLoader.loaders)
      },
      plugins: this.configPlugin.getWebpackPlugin().concat(this.webpackPlugin.plugins)
    }, this.configOption.getWebpackOption(), this.webpackOption.options);
  }
}

WebpackBuilder.DEV = 'dev';
WebpackBuilder.TEST = 'test';
WebpackBuilder.PROD = 'prod';

module.exports = WebpackBuilder;
