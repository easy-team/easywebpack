'use strict';
const WebpackBaseBuilder = require('./base');
const WebpackTool = require('webpack-tool');
const merge = WebpackTool.merge;
class WebpackServerBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.ssr = true;
    this.type = 'server';
    if (this.config.egg) {
      this.setBuildPath('app/view');
    } else {
      this.setPrefix(this.prefix || 'server');
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
    const prefix = this.config.egg ? '' : this.prefix;
    this.config.filename = this.utils.assetsPath(prefix, '[name].js');
    this.config.chunkFilename = undefined;
  }

  create() {
    this.initCreate();
    this.initEntry();
    return super.create();
  }
}

module.exports = WebpackServerBuilder;
