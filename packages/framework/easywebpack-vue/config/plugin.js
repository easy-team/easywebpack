'use strict';
const VueSSRDynamicChunkPlugin = require('./plugin/vue-ssr-dynamic-chunk-webpack-plugin');

exports.vuessrchunk = {
  type: ['server'],
  name: new VueSSRDynamicChunkPlugin(),
  args: {
  }
};

exports.extract = {
  env: ['dev', 'test', 'prod'],
};
