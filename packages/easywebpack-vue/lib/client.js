'use strict';
const EasyWebpack = require('easywebpack');
const WebpackBaseBuilder = require('./base');
const babelrc = require('../config/babel.web');
class WebpackClientBuilder extends WebpackBaseBuilder(EasyWebpack.WebpackClientBuilder) {
  constructor(config) {
    super(config);
    this.setBabelrc(babelrc);
    this.setAlias('vue', 'vue/dist/vue.common.js', false);
  }
}
module.exports = WebpackClientBuilder;
