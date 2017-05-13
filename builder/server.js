'use strict';
const path = require('path');
const WebpackBaseBuilder = require('./base');
const Utils = require('../utils/utils');

class WebpackServerBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.initServerOption();
    this.setCssExtract(false);
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
}

module.exports = WebpackServerBuilder;
