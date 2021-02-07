'use strict';
const EasyWebpack = require('easywebpack');
const WebpackBaseBuilder = require('./base');
const babelrc = require('../config/babel.node');
class WebpackServerBuilder extends WebpackBaseBuilder(EasyWebpack.WebpackServerBuilder) {
  constructor(config) {
    super(config);
    this.setBabelrc(babelrc);
    this.setDefine({ 'process.env.VUE_ENV': '"server"' });
    this.setAlias('vue', 'vue/dist/vue.runtime.common.js', false);
    this.setStyleLoader('vue-style-loader');
  }
}
module.exports = WebpackServerBuilder;
