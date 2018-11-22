'use strict';
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = class WebpackOptimize {
  constructor(ctx) {
    this.ctx = ctx;
    this.optimization = ctx.utils.cloneDeep(ctx.config.optimization || {});
    this.lib = this.ctx.config.lib;
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

  getCacheVendors() {
    const modules = [];
    const files = [];
    const lib = this.lib || ['.*'];
    lib.forEach(m => {
      if (/\.(jsx?|tsx?)$/.test(m)) {
        files.push(m);
      } else {
        modules.push(m);
      }
    });
    files.unshift(`node_modules/_?(${modules.join('|')})(@|/)`);
    const strRegex = files.join('|');
    const test = new RegExp(strRegex);
    return {
      name: 'common',
      chunks: 'all',
      minChunks: 1,
      test: module => {
        return test.test(module.context);
      }
    };
  }

  getCacheStyles() {
    return {
      name: 'common',
      chunks: 'all',
      minChunks: 2,
      test: /\.(css|less|scss|stylus)$/,
      enforce: true,
      priority: 50
    };
  }

  normalizeMinimizer() {
    if (!this.ctx.prod && this.optimization.minimizer) {
      delete this.optimization.minimizer;
    }
    // compatible old config
    if (this.ctx.prod && !this.optimization.minimizer) {
      const uglifyJs = this.ctx.getConfigPlugin('uglifyJs');
      if (uglifyJs) {
        const args = this.ctx.utils.isObject(uglifyJs) ? uglifyJs.args || uglifyJs : {};
        const options = this.ctx.merge({
          cache: true,
          parallel: 4,
          sourceMap: !!this.ctx.devtool,
          uglifyOptions: {
            ie8: false,
            warnings: false,
            compress: {
              dead_code: true,
              drop_console: true,
              drop_debugger: true
            },
            output: {
              comments: false
            }
          }
        }, args);
        this.optimization.minimizer = [ new UglifyJsPlugin(options) ];
      }
    }
    return this.optimization;
  }

  getOptimization() {
    const { runtimeChunk, splitChunks } = this.optimization;
    if (runtimeChunk) {
      delete this.optimization.runtimeChunk;
    }
    if (splitChunks) {
      delete this.optimization.splitChunks;
    }
    return this.normalizeMinimizer();
  }

  getWebOptimization() {
    const optimization = this.normalizeMinimizer();
    return this.ctx.merge({
      namedModules: true,
      namedChunks: true,
      runtimeChunk: {
        name: 'runtime'
      },
      splitChunks: {
        name: false,
        chunks: 'all',
        minSize: this.lib ? 1 : 10000,
        minChunks: this.lib ? 1 : 2,
        cacheGroups: {
          default: false,
          vendors: this.getCacheVendors(),
          styles: this.getCacheStyles()
        }
      }
    }, optimization);
  }

  getNodeOptimization() {
    return this.getOptimization();
  }
};