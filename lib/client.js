'use strict';
const path = require('path');
const webpack = require('webpack');
const Utils = require('../utils/utils');
const WebpackBaseBuilder = require('./base');
const ManifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

class WebpackClientBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.initClientOption();
    this.initClientPlugin();
    this.initHotEntry();
    this.setCssExtract(this.prod);
    this.setMiniCss(this.prod);
  }

  initHotEntry() {
    if (!this.prod) {
      const hotMiddleware = require.resolve('webpack-hot-middleware').split(path.sep);

      hotMiddleware.pop();
      const hotConfig = `${path.posix.join(hotMiddleware.join(path.sep))}/client?path=http://${Utils.getIp()}:${this.config.build.port}/__webpack_hmr&noInfo=false&reload=false&quiet=false`;

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

  initClientPlugin() {
    if (this.config.build.commonsChunk) {
      this.addPlugin(webpack.optimize.CommonsChunkPlugin, () => ({ names: this.config.build.commonsChunk }));
    }
    this.addPlugin(webpack.LoaderOptionsPlugin, () => ({ minimize: this.isMiniCss }));
  }

  setFileNameHash(isHash, len = 7) {
    super.setFileNameHash(isHash, len);
    this.setOption({
      output: {
        filename: this.filename,
        chunkFilename: this.chunkFilename
      }
    });
  }

  createWebpackPlugin() {
    if (this.isCreateManifest) {
      this.addPlugin(ManifestPlugin, () => {
        const manifest = this.config.build.manifest || 'manifest.json';
        const buildPath = this.config.build.path;
        const fileName = path.relative(buildPath, manifest);
        return { fileName };
      });
    }
    if (this.extractCss) {
      this.addPlugin(ExtractTextPlugin, () => this.cssName);
    }
    if (!this.prod) {
      this.addPlugin(webpack.HotModuleReplacementPlugin);
    }
    return super.createWebpackPlugin();
  }
}
module.exports = WebpackClientBuilder;
