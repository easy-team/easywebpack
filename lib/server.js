'use strict';
const path = require('path');
const webpack = require('webpack');
const WebpackBaseBuilder = require('./base');
const Utils = require('../utils/utils');

class WebpackServerBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.initServerOption();
    this.setCssExtract(false);
    this.addPlugin(webpack.DefinePlugin, { 'process.env.VUE_ENV': '"server"' });
  }

  initServerOption() {
    this.setOption({
      target: 'node',
      output: {
        libraryTarget: 'commonjs2',
        path: path.join(this.config.baseDir, 'app/view'),
        filename: '[name].js'
      },
      context: __dirname,
      node: {
        __filename: false,
        __dirname: false
      },
      externals: Utils.loadNodeModules()
    });
  }
}

module.exports = WebpackServerBuilder;
