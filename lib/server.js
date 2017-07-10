'use strict';
const WebpackBaseBuilder = require('./base');
const Utils = require('../utils/utils');

class WebpackServerBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.type = 'server';
    this.setPrefix('server');
  }

  initServerOption() {
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
      externals: Utils.loadNodeModules()
    });
  }

  ignoreCSS() {
    this.plugins.unshift({
      clazz: webpack.NormalModuleReplacementPlugin,
      args: [/\.css$/, require.resolve('node-noop')]
    }, {
      clazz: webpack.IgnorePlugin,
      args: /\.(css|less|scss|sass)$/
    });
  }

  create() {
    this.filename = Utils.assetsPath(this.prefix, '[name].js');
    this.initServerOption();
    return super.create();
  }
}

module.exports = WebpackServerBuilder;
