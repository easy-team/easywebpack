'use strict';
const ConfigOption = require('../config/option');
const ConfigPlugin = require('../config/plugin');
const ConfigLoader = require('../config/loader');
const WebpackOption = require('./option');
const WebpackLoader = require('./loader');
const WebpackPlugin = require('./plugin');
const WebpackConfig = require('./config');

class WebpackBuilder {
  constructor(config, configOption, configLoader, configPlugin) {
    this.env = process.env.BUILD_ENV;
    this.configOption = configOption || new ConfigOption(config);
    this.configLoader = configLoader || new ConfigLoader(config);
    this.configPlugin = configPlugin || new ConfigPlugin(config);
    this.webpackOption = new WebpackOption(config);
    this.webpackLoader = new WebpackLoader(config);
    this.webpackPlugin = new WebpackPlugin(config);
  }

  useHash(isHash) {
    this.configOption.useHash(isHash);
    this.configLoader.useHash(isHash);
    this.configPlugin.useHash(isHash);
  }

  useExtract(isExtract) {
    this.configLoader.useExtract(isExtract);
    this.configPlugin.setExtractTextPluginEnable(isExtract);
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
WebpackBuilder.DEV = 'dev';
WebpackBuilder.TEST = 'test';
WebpackBuilder.PROD = 'prod';
module.exports = WebpackBuilder;
