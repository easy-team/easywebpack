'use strict';
const WebpackBaseBuilder = require('./base');
const Utils = require('../utils/utils');
const merge = require('webpack-merge');

class WebpackServerBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
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
      context: __dirname,
      node: {
        __filename: false,
        __dirname: false
      },
      externals: Utils.loadNodeModules(this.dev)
    });
  }

  ignoreCSS() {
    this.plugins.unshift({
      clazz: this.webpack.NormalModuleReplacementPlugin,
      args: [/\.css$/, require.resolve('node-noop')]
    }, {
      clazz: this.webpack.IgnorePlugin,
      args: /\.(css|less|scss|sass)$/
    });
  }

  create() {
    this.initCreate();
    this.createEntry();
    this.createFileName();
    this.setFileName('[name].js');
    return super.create();
  }
}

module.exports = WebpackServerBuilder;
