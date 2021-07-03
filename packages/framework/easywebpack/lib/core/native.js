'use strict';
const path = require('path');
const baseDir = process.cwd();
const webpackConfig = {
  context: baseDir,
  entry: {},
  output: {},
  resolve: {
    extensions: ['.js']
  },
  externals: [],
  resolveLoader: {
    modules: [
      path.join(baseDir, 'node_modules')
    ]
  },
  stats: {
    colors: true,
    children: false,
    modules: false,
    chunks: false,
    chunkModules: false,
    entrypoints: false
  }
};

// yarn workspace / lerna
if (process.env.INIT_CWD) {
  const initCwdModulePath = path.join(process.env.INIT_CWD, 'node_modules');
  if (!webpackConfig.resolveLoader.modules.some(m => m === initCwdModulePath)) {
    webpackConfig.resolveLoader.modules.push(initCwdModulePath);
  }
}

// current pkg module
const currentModulePath = path.join(__dirname, '../../node_modules');
if (!webpackConfig.resolveLoader.modules.some(m => m === currentModulePath)) {
  webpackConfig.resolveLoader.modules.push(currentModulePath);
}

module.exports = webpackConfig;