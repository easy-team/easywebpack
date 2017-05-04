'use strict';
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const Utils = require('../utils/utils');
const ConfigBase = require('./base');

class ConfigOption extends ConfigBase {

  constructor(config) {
    super(config);
    this.setFileNameHash(this.PROD);
  }

  getWebpackOption(options) {
    return this.config.isServer ? this.initServer(options) : this.initClient(options);
  }

  setFileNameHash(isHash, len = 7) {
    if (isHash) {
      this.filename = Utils.assetsPath(this.config, `js/[name].[hash:${len}].js`);
      this.chunkFilename = Utils.assetsPath(this.config, `js/[id].[chunkhash:${len}].js`);
    } else {
      this.filename = Utils.assetsPath(this.config, 'js/[name].js');
      this.chunkFilename = Utils.assetsPath(this.config, 'js/[id].js');
    }
  }

  initBase(options) {
    return merge({
      entry: Utils.getEntry(this.config.build.entry),
      resolve: {
        extensions: ['.js']
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        })
      ]
    }, options);
  }

  initClient(options) {
    const buildPath = this.config.build.path;
    return merge(this.initBase(), {
      output: {
        path: path.isAbsolute(buildPath) ? buildPath : path.join(this.config.baseDir, buildPath),
        publicPath: this.config.build.publicPath,
        filename: this.filename,
        chunkFilename: this.chunkFilename
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
