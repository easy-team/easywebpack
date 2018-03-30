'use strict';
const path = require('path');
const baseDir = process.cwd();

exports.config = {
  baseDir,
  port:9000,
  buildPath: 'public',
  publicPath: '/public/',
  hashLength: 8,
  cache: true,
  alias: {},
  packs: {},
  cdn: {},
  install:{
    check: false
  },
  loaders: {},
  plugins: {},
  optimization: {
    minimize: false
  },
  compile:{
    cache: false,
    thread: false
  }
};

exports.devConfig = {
  hash: false,
  cssExtract: false,
  plugins:{
    hot: true,
  }
};

exports.testConfig = {
  hash: true,
  cssExtract: true,
  plugins:{
    hot: false,
  }
};

exports.prodConfig = {
  hash: true,
  cssExtract: true,
  loaders: {
    css: {
      options: {
        minimize: true
      }
    }
  },
  plugins:{
    hot: false,
  }
};

exports.dllConfig = {
  cssExtract: false,
  loaders: {
    eslint: false,
    scss: false,
    sass: false,
    less: false,
    stylus: false
  },
  plugins: {
    html: false,
    runtime: false,
    commonsChunk: false,
    imagemini: false,
    manifest: false,
    manifestDll: true,
    tsChecker: false
  }
};