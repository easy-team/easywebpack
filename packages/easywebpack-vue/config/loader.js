'use strict';
exports.vue = {
  test: /\.vue$/,
  exclude: /node_modules/,
  use: [
    { loader: 'vue-loader' }
  ]
};

exports.vuehtml = {
  test: /\.html$/,
  use: ['vue-html-loader']
};

exports.ts = {
  enable: false,
  options: {
    appendTsSuffixTo: [/\.vue$/]
  }
};

exports.urlimage = {
  options: {
    esModule: false
  }
};

exports.urlmedia = {
  options: {
    esModule: false
  }
};

exports.urlfont = {
  options: {
    esModule: false
  }
};