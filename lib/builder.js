'use strict';
const merge = require('webpack-merge');
const ConfigOption = require('../config/option');
const ConfigPlugin = require('../config/plugin');
const ConfigLoader = require('../config/loader');
const WebpackOption = require('./option');
const WebpackLoader = require('./loader');
const WebpackPlugin = require('./plugin');
const WebpackConfig = require('./config');
const WebpackBase = require('./base');

class WebpackBuilder extends WebpackBase {
  constructor(config, options, configOption, configLoader, configPlugin) {
    super(merge(config, options));
    this.configOption = configOption || new ConfigOption(this.config);
    this.configLoader = configLoader || new ConfigLoader(this.config);
    this.configPlugin = configPlugin || new ConfigPlugin(this.config);
    this.webpackOption = new WebpackOption(this.config);
    this.webpackLoader = new WebpackLoader(this.config);
    this.webpackPlugin = new WebpackPlugin(this.config);
    this.init();
  }

  init() {

  }

  useHash(isHash) {
    this.configOption.useHash(isHash);
    this.configLoader.useHash(isHash);
    this.configPlugin.useHash(isHash);
  }

  setOption(option) {
    this.webpackOption.setOption(option);
  }

  setLoader(loader) {
    this.webpackLoader.setLoader(loader);
  }

  setPlugin(plugin) {
    this.webpackPlugin.setPlugin(plugin);
  }

  create() {
    this.setOption(this.configOption.getOption());
    this.setLoader(this.configLoader.getLoader());
    this.setPlugin(this.configPlugin.getPlugin());
    return new WebpackConfig(this.webpackOption, this.webpackLoader, this.webpackPlugin).create();
  }
}
module.exports = WebpackBuilder;
