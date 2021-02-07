'use strict';
const ReactSSRDynamicChunkPlugin = require('./plugin/react-ssr-dynamic-chunk-webpack-plugin');
exports.reactssrchunk = {
  type: ['server'],
  name: new ReactSSRDynamicChunkPlugin(),
  args: {
  }
};

exports.extract = {
  env: ['dev', 'test', 'prod'],
};

exports.modulereplacement = false;

exports.ignore = false;

