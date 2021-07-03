'use strict';
const path = require('path');
const EasyWebpack = require('@easy-team/easywebpack');
const merge = EasyWebpack.merge;
class WebpackClientBuilder extends EasyWebpack.WebpackClientBuilder {
  constructor(config) {
    super(config);
    this.mergeConfig(require('../config/config'));
    this.setLibraryTarget('umd');
    this.setResolveLoader({ modules: [path.join(__dirname, '../node_modules')] });
  }

  createFileName() {
    this.setOutputFileName('[name].js');
    this.setOutputFileChunkName('[name].chunk.js');
  }

  createImageName() {
    this.webpackInfo.imageName = 'img/[name].[ext]';
  }

  createCssName() {
    this.webpackInfo.cssName = 'css/[name].css';
  }

  createFrontName() {
    this.webpackInfo.frontName = 'font/[name].[ext]';
  }

  createOptimization() {
    return this.webpackOptimize.getOptimization();
  }
}
module.exports = WebpackClientBuilder;