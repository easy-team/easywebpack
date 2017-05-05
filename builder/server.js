'use strict';
const path = require('path');
const webpack = require('webpack');
const WebpackBaseBuilder = require('./base');
const Utils = require('../utils/utils');

class WebpackServerBuilder extends WebpackBaseBuilder {
  constructor(config, options) {
    super(config, options);
    this.initServerOption();
    this.initServerConfigPlugin();
  }

  initServerOption() {
    this.setOption({
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
    });
  }

  initServerConfigPlugin() {
    this.configPlugins.unshift({
      clazz: webpack.NormalModuleReplacementPlugin,
      args: [/\.css$/, require.resolve('node-noop')],
    }, {
      clazz: webpack.IgnorePlugin,
      args: /\.(css|less|scss|sass)$/
    });
  }
}

module.exports = WebpackServerBuilder;
