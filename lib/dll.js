'use strict';
const path = require('path');
const fs = require('fs');
const WebpackBaseBuilder = require('./base');
const merge = require('webpack-merge');
const Config = require('../config/config');
class WebpackDllBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.type = 'client';
    this.setProxy(true);
    this.setDefault(Config.dllConfig);
    this.setDevTool(this.config.devtool);
    this.setOption({
      output:{
        library: "[name]_[hash]"
      }
    });
    this.addPlugin({
      dll: new this.webpack.DllPlugin({
        context: this.config.baseDir,
        path: this.getDllFilePath(),
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