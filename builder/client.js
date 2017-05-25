'use strict';
const path = require('path');
const webpack = require('webpack');
const Utils = require('../utils/utils');
const WebpackBaseBuilder = require('./base');
const ManifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
class WebpackClientBuilder extends WebpackBaseBuilder {
  constructor(config, options) {
    super(config, options);
    this.initClientOption();
    this.initClientConfigPlugin();
    this.initHotEntry();
    this.setCssExtract(this.prod);
  }

  initHotEntry() {
    if (!this.prod) {
      const hotMiddleware = require.resolve('webpack-hot-middleware').split(path.sep);
      hotMiddleware.pop();
      const hotConfig = path.join(hotMiddleware.join(path.sep),`client?path=http://${Utils.getIp()}:${this.config.build.port}/__webpack_hmr&noInfo=false&reload=false&quiet=false`);
      Object.keys(this.options.entry).forEach(name => {
        if (!/\./.test(name)) {
          this.options.entry[name] = [hotConfig].concat(this.options.entry[name]);
        }
      });
    }
  }

  initClientOption() {
    const buildPath = this.config.build.path;
    this.setOption({
      output: {
        path: path.isAbsolute(buildPath) ? buildPath : path.join(this.config.baseDir, buildPath),
        filename: this.filename,
        chunkFilename: this.chunkFilename
      }
    });
  }

  initClientConfigPlugin() {
    this.configPlugins.push({
      clazz: ManifestPlugin,
      args: {
        fileName: '../config/manifest.json'
      }
    });
    this.configPlugins.push({
      clazz: webpack.optimize.CommonsChunkPlugin,
      args: () => {
        return {
          names: this.config.build.commonsChunk
        }
      }
    });
    this.configPlugins.push({
      clazz: ExtractTextPlugin,
      args: () => {
        return this.cssName
      }
    });
    this.configPlugins.push({
      enable: () => {
        return !this.prod;
      },
      clazz: webpack.HotModuleReplacementPlugin
    });
  }
}
module.exports = WebpackClientBuilder;
