'use strict';
const path = require('path');
const merge = require('webpack-merge');
const WebpackTool = require('../../webpack-tool');
const Utils = WebpackTool.Utils;
const ConfigBase = require('./base');

class ConfigOption extends ConfigBase {

  constructor(config) {
    super(config);
    this.options = this.client ? this.initClient() : this.initServer();
  }

  getOption() {
    return this.options;
  }

  setOption(option) {
    this.options = merge(this.options, option);
  }

  initBase(options) {
    return merge({
      entry: Utils.getEntry(this.config.build.entry),
      resolve: {
        extensions: ['.js', '.css', '.scss']
      }
    }, options);
  }

  initClient(options) {
    const buildPath = this.config.build.path;
    return merge(this.initBase(), {
      output: {
        path: path.isAbsolute(buildPath) ? buildPath : path.join(this.config.baseDir, buildPath),
        publicPath: this.config.build.publicPath,
        filename: Utils.assetsPath(this.config, 'js/[name].[hash:7].js'),
        chunkFilename: Utils.assetsPath(this.config, 'js/[id].[hash:7].js')
      }
    }, options);
  }

  initServer(options) {
    return merge(this.initBase(), {
      target: 'node',
      output: {
        libraryTarget: 'commonjs2',
        path: path.join(this.config.baseDir, 'app/view')
      },
      context: __dirname,
      node: {
        __filename: false,
        __dirname: false
      },
      externals: Utils.loadNodeModules()
    }, options);
  }
}

module.exports = ConfigOption;
