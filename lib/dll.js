'use strict';
const path = require('path');
const fs = require('fs');
const WebpackBaseBuilder = require('./base');
const defaultConfig = require('../config/config');
class WebpackDllBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.type = 'client';
    this.setDevTool(this.config.devtool);
    this.mergeConfig(defaultConfig.dllConfig);
    this.addPlugin({
      dll: new this.webpack.DllPlugin({
        path: this.getDllManifestPath(),
        name: '[name]_[hash]'
      })
    });
  }

  create() {
    this.initCreate();
    this.initEntry();
    return super.create();
  }
}
module.exports = WebpackDllBuilder;