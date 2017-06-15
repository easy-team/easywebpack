'use strict';
const webpack = require('webpack');
const WebpackBaseBuilder = require('./base');
const Utils = require('../utils/utils');

class WebpackServerBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.setPrefix('server');
    this.initServerOption();
    this.setCssExtract(false);
    this.addPlugin(webpack.DefinePlugin, { 'process.env.VUE_ENV': '"server"' });
  }

  initServerOption() {
    this.setOption({
      target: 'node',
      output: {
        libraryTarget: 'commonjs2',
        filename: Utils.assetsPath(this.prefix, '[name].js')
      },
      context: __dirname,
      node: {
        __filename: false,
        __dirname: false
      },
      externals: Utils.loadNodeModules()
    });
  }

  create() {
    this.setOption({
      output: {
        filename: Utils.assetsPath(this.prefix, '[name].js')
      }
    });
    return super.create();
  }
}

module.exports = WebpackServerBuilder;
