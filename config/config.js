'use strict';
const path = require('path');

module.exports = baseDir => {
  return {
    baseDir: baseDir,
    build: {
      path: 'public',
      publicPath: '/public/',
      prefix: 'static',
      entry: [path.join(baseDir, 'build')],
      commonsChunk: ['vendor']
    },
    webpack: {
      styleLoader: 'style-loader',
      loaderOption: {
        sass: {
          includePaths: [path.resolve(baseDir, 'app/web/asset/style')]
        }
      },
      pluginOption: {
        ExtractTextPlugin: {
          extract: true
        }
      }
    }
  }
};
