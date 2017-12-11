'use strict';
const path = require('path');
const baseDir = process.cwd();

exports.baseConfig = {
  baseDir,
  buildPath: 'public',
  publicPath: '/public/',
  prefix: '',
  alias: {},
  packs: {},
  cdn: {},
  install:{
    check: false
  },
  loaders: {},
  plugins: {
    manifest: {}
  }
};

exports.devConfig = {
  hot: true,
  hash: false,
  miniJs: false,
  miniCss: false,
  miniImage: false,
  cssExtract: false
};

exports.testConfig = {
  hot: false,
  hash: true,
  miniJs: false,
  miniCss: false,
  miniImage: false,
  cssExtract: true
};

exports.prodConfig = {
  hot: false,
  hash: true,
  miniJs: true,
  miniCss: true,
  miniImage: true,
  cssExtract: true,
  loaders: {
    css: {
      options: {
        minimize: true
      }
    }
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
    buildfile: false,
    manifest: false,
    manifestDeps: false,
    manifestDll: true
  }
};