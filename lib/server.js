'use strict';
const WebpackBaseBuilder = require('./base');
const nodeExternals = require('webpack-node-externals')
class WebpackServerBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.ssr = true;
    this.type = WebpackServerBuilder.TYPE;
    if (this.config.egg) {
      this.setBuildPath('app/view', true);
    } else {
      this.setPrefix(this.prefix || 'server');
    }
    this.setTarget(WebpackServerBuilder.TARGET);
    this.setLibraryTarget('commonjs2');
    this.setExternals([nodeExternals({ importType: 'commonjs2' })]);
    this.setNode({
      __filename: false,
      __dirname: false
    });
    this.createFileName();
  }

  createFileName() {
    const prefix = this.config.egg ? '' : this.config.prefix;
    this.setOutputFileName(this.utils.assetsPath(prefix, '[name].js'));
  }
}
WebpackServerBuilder.TYPE = 'server';
WebpackServerBuilder.TARGET = 'node';
module.exports = WebpackServerBuilder;
