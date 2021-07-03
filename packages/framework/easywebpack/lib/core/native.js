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
      path.join(baseDir, 'node_modules'),
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

const currentModulePath = path.join(__dirname, '../../node_modules');
if (!webpackConfig.resolveLoader.modules.some(m => m === currentModulePath )) {
  webpackConfig.resolveLoader.modules.push(currentModulePath);
}

module.exports = webpackConfig;