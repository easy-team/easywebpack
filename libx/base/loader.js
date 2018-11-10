'use strict';
module.exports = class WebpackLoader {
  constructor(ctx) {
    this.ctx = ctx;
    this.loaders = ['babel', 'css', 'image', 'media', 'font'];
  }

  create() {
    return this.loaders.map(label => {
      return this[label].call(this);
    });
  }

  enable(label, position) {
    if (this.loaders.includes[label]) {
      console.warn('loader had registed');
      return;
    }
    this.loaders.push(label);
    return this;
  }

  disable(label) {
    const index = this.loaders.findIndex(name => {
      return label === name;
    });
    if (index > -1) {
      this.loaders.splice(index, 1);
    }
    return this;
  }

  createLoader(loader, options) {
    if (typeof loader === 'string') {
      return { loader, options };
    }
    return this.merge(loader, { options });
  }

  createCacheLoader(info) {
    const loader = 'cache-loader';
    const cacheDirectory = this.utils.getCacheLoaderInfoPath(loader, this.env, this.type);
    return this.createLoader({
      loader,
      options: {
        cacheDirectory
      }
    }, info);
  }

  createThreadLoader(info) {
    return this.createLoader({
      loader: 'thread-loader',
      options: {
        workers: 2
      }
    }, info);
  }

  createBabelLoader(info) {
    return this.createLoader('babel-loader', info);
  }

  createTSLoader(info) {
    return this.createLoader('ts-loader', info);
  }
};