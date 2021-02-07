'use strict';
const EasyWebpack = require('easywebpack');
const WebpackReactBaseBuilder = require('./base');
const babelrc = require('../config/babel.node');
class WebpackServerBuilder extends WebpackReactBaseBuilder(EasyWebpack.WebpackServerBuilder){
  constructor(config) {
    super(config);
    this.setBabelrc(babelrc);
    this.setStyleLoader('isomorphic-style-loader');
  }
}
module.exports = WebpackServerBuilder;
