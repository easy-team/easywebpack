'use strict';
const EasyWebpack = require('easywebpack');
const WebpackReactBaseBuilder = require('./base');
const babelrc = require('../config/babel.node');
// eslint-disable-next-line new-cap
class WebpackServerBuilder extends WebpackReactBaseBuilder(EasyWebpack.WebpackServerBuilder) {
  constructor(config) {
    super(config);
    this.setBabelrc(babelrc);
    this.setStyleLoader('isomorphic-style-loader');
  }
}
module.exports = WebpackServerBuilder;
