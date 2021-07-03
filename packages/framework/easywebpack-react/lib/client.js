'use strict';
const EasyWebpack = require('easywebpack');
const WebpackReactBaseBuilder = require('./base');
const babelrc = require('../config/babel.web');
class WebpackClientBuilder extends WebpackReactBaseBuilder(EasyWebpack.WebpackClientBuilder) {
  constructor(config = {}) {
    super(config);
    if (this.dev) {
      this.setAlias('react-dom', '@hot-loader/react-dom', false)
    }
    this.setBabelrc(babelrc);
    this.normalizeExtract(config);
  }

  normalizeExtract(config) {
    // default ssr dev extract true
    if (this.egg && !config.target) {
      this.mergePlugin({ extract: { env: ['dev'] } });
    }
  }

  createHotEntry() {
    if (this.hot) {
      super.createHotEntry();
      Object.keys(this.webpackConfig.entry).forEach(name => {        
        this.webpackConfig.entry[name] = ['react-hot-loader/patch'].concat(this.webpackConfig.entry[name]);
      });
    }
  }
}
module.exports = WebpackClientBuilder;
