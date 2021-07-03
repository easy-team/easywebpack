'use strict';
const { getVueLoadPlugin } = require('../lib/utils');
const VueLoaderPlugin = getVueLoadPlugin();
const VueSSRDynamicChunkPlugin = require('./plugin/vue-ssr-dynamic-chunk-webpack-plugin');

exports.vuessrchunk = {
  type: ['server'],
  name: new VueSSRDynamicChunkPlugin(),
  args: {
  }
};

// see vue-loader 15 https://vue-loader.vuejs.org/zh/migrating.html#loader
exports.vueloader = {
  name: new VueLoaderPlugin()
};

exports.extract = {
  env: ['dev', 'test', 'prod'],
};
