'use strict';
const path = require('path');
const merge = require('webpack-merge');

module.exports = config => {
  const baseDir = config && config.baseDir || path.join(__dirname, '../../../');

  return merge({
    baseDir,
    build: {
      port: 8090, // webpack-hot-middleware port
      path: path.join(baseDir, 'public'), // webpack compile result dir, support absolution path
      publicPath: '/public/', // static router prefix
      staticPrefix: 'static', // webpack static resource prefix for publicPath
      entry: path.join(baseDir, 'app/web/page'), // webpack entry dir
      commonsChunk: ['vendor'], // webpack.optimize.CommonsChunkPlugin
      manifest: path.join(baseDir, 'config/manifest.json'),
      buildConfig: path.join(baseDir, 'config/buildConfig.json')
    }
  }, config);
};
