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
    configOption = configOption || new ConfigOption(config);
    configLoader = configLoader || new ConfigLoader(config);
    configPlugin = configPlugin || new ConfigPlugin(config);
    this.webpackOption = new WebpackOption(configOption.getOption());
    this.webpackLoader = new WebpackLoader(configLoader.getLoader());
    this.webpackPlugin = new WebpackPlugin(configPlugin.getPlugin());
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
    const webpackConfig = new WebpackConfig(this.webpackOption, this.webpackLoader, this.webpackPlugin).create();
    console.log('------builder----', webpackConfig);
    return webpackConfig;
  }
}
module.exports = WebpackBuilder;
