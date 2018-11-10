'use strict';
const path = require('path');
const fs = require('fs');
const uniq = require('lodash.uniq');
const { webpack, merge } = require('webpack-tool');
const WebpackInit = require('./init');
const WebpackOption = require('./option');
const WebpackLoader = require('./loader');
const WebpackPlugin = require('./plugin');
const WebpackOptimize = require('./optimize');
class WebpackBuilder {
  constructor(config) {
    this.config = config;
    this.webpack = webpack;
    this.merge = merge({
      customizeArray(a, b, key) {
        return uniq([...a, ...b]);
      }
    });
    this.webpackConfig = new WebpackInit(this);
    this.webpackOption = new WebpackOption(this);
    this.webpackLoader = new WebpackLoader(this);
    this.webpackPlugin = new WebpackPlugin(this);
    this.webpackOptimize = new WebpackOptimize(this);
  }
  customize() {
    return this.webpackConfig;
  }
  create() {
    return this.webpackConfig;
  }
}

module.exports = WebpackBuilder;