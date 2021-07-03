'use strict';
const EasyWebpack = require('easywebpack');
const { isVue3 } = require('./utils');
const WebpackBaseBuilder = require('./base');
const babelrc = require('../config/babel.web');
// eslint-disable-next-line new-cap
class WebpackClientBuilder extends WebpackBaseBuilder(EasyWebpack.WebpackClientBuilder) {
  constructor(config) {
    super(config);
    this.setBabelrc(babelrc);
    if (isVue3(this.baseDir)) {
      this.setAlias('vue', 'vue/dist/vue.runtime.esm-bundler.js', false);
    } else {
      this.setAlias('vue', 'vue/dist/vue.common.js', false);
    }
  }
}
module.exports = WebpackClientBuilder;
