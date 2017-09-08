'use strict';
const WebpackBaseBuilder = require('./base');
const WebpackTool = require('webpack-tool');
const merge = WebpackTool.merge;
class WebpackServerBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(merge({ cssExtract: false }, config));
    this.ssr = true;
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
      externals: this.utils.loadNodeModules(this.dev)
    });
  }

  createFileName() {
    this.config.filename = this.utils.assetsPath(this.config.prefix, '[name].js');
    this.config.chunkFilename = undefined;
  }

  create() {
    this.initCreate();
    this.initEntry();
    return super.create();
  }
}

module.exports = WebpackServerBuilder;
