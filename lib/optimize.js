'use strict';
module.exports = class WebpackOptimize {
  constructor(ctx) {
    this.ctx = ctx;
  }

  getCommonsChunk() {
    const commonsChunks = [];
    const optimization = this.getWebOptimization();
    const { runtimeChunk = {}, splitChunks = {} } = optimization;
    const { cacheGroups = {} } = splitChunks;
    if (runtimeChunk.name) {
      commonsChunks.push(runtimeChunk.name);
    }
    Object.keys(cacheGroups).forEach(key => {
      const group = cacheGroups[key];
      const name = group.name || key;
      if (!commonsChunks.includes(name)) {
        commonsChunks.push(name);
      }
    });
    return commonsChunks;
  }

  getOptimization() {
    return {};
  }

  getWebOptimization() {
    return {
      runtimeChunk: {
        name: 'runtime'
      },
      splitChunks: {
        chunks: 'async',
        minSize: 30000,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        name: false,
        cacheGroups: {
          common: {
            name: 'common',
            chunks: 'initial',
            minChunks: 2,
            test: /node_modules\/(.*)\.js/
          },
          styles: {
            name: 'common',
            chunks: 'all',
            minChunks: 2,
            test: /\.(css|less|scss|stylus)$/
          }
        }
      }
    };
  }

  getNodeOptimization() {
    return this.getOptimization();
  }
};