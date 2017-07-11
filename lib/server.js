'use strict';
const WebpackBaseBuilder = require('./base');
const Utils = require('../utils/utils');

class WebpackServerBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.type ='server';
    if(this.config.egg){
      this.setBuildPath('app/view');
    }else{
      this.setPrefix(this.config.prefix || 'server');
    }
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
    this.prepare();
    this.createEntry();
    this.initServerOption();
    this.setFileName('[name].js');
    return super.create();
  }
}

module.exports = WebpackServerBuilder;
