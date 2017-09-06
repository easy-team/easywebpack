'use strict';
const WebpackBaseBuilder = require('./base');
const Utils = require('../utils/utils');
const WebpackTool = require('webpack-tool');
const merge = WebpackTool.merge;
class WebpackServerBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(merge({ cssExtract: false }, config));
    this.type = 'server';
    if (this.config.egg) {
      this.setBuildPath('app/view');
      this.setPublicPath('client', false);
    } else {
      this.setPrefix(this.config.prefix || 'server');
    }
    this.initEasyWebpackServer();
  }

  initEasyWebpackServer() {
    this.setOption({
      target: 'node',
      output: {
        libraryTarget: 'commonjs2'
      },
      context: process.cwd(),
      node: {
        __filename: false,
        __dirname: false
      },
      externals: Utils.loadNodeModules(this.dev)
    });
  }

  createFileName() {
    this.config.filename = Utils.assetsPath(this.config.prefix, '[name].js');
    this.config.chunkFilename = undefined;
  }

  create() {
    this.initCreate();
    this.initEntry();
    return super.create();
  }
}

module.exports = WebpackServerBuilder;
