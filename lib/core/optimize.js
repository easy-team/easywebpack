'use strict';
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
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
    if (this.ctx.utils.isObject(runtimeChunk) && runtimeChunk.name) {
      commonsChunks.push(runtimeChunk.name);
    }
    if (this.ctx.utils.isObject(splitChunks)) {
      const { cacheGroups = {} } = splitChunks;
      Object.keys(cacheGroups).forEach(key => {
        const group = cacheGroups[key];
        const name = group.name || key;
        if (!commonsChunks.includes(name)) {
          commonsChunks.push(name);
        }
      });
    }
    return commonsChunks;
  }

  getCacheVendors(minChunks) {
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
      minChunks,
      test: module => {
        return test.test(module.context);
      }
    };
  }

  getCacheStyles(minChunks) {
    return {
      name: 'common',
      chunks: 'all',
      minChunks,
      test: /\.(css|less|scss|stylus)$/,
      enforce: true,
      priority: 50
    };
  }

  normalizeChunks() {
    const { runtimeChunk, splitChunks } = this.optimization;
    if (runtimeChunk) {
      delete this.optimization.runtimeChunk;
    }
    if (splitChunks) {
      delete this.optimization.splitChunks;
    }
  }

  normalizeMinimizer(minimizer) {
    if (!this.ctx.prod && this.optimization.minimizer) {
      delete this.optimization.minimizer;
    }
    if (minimizer) {
      this.optimization.minimizer = [].concat(minimizer);
    }
    return this.optimization;
  }

  getMinimizerOptions() {
    if (this.ctx.prod && !this.optimization.minimizer) {
      const uglifyJs = this.ctx.getConfigPlugin('uglifyJs');
      if (uglifyJs === true) {
        return {};
      }
      if (this.ctx.utils.isObject(uglifyJs)) {
        return uglifyJs.args || uglifyJs;
      }
    }
    return null;
  }

  createUglifyJsMinimizer() {
    const options = this.getMinimizerOptions();
    if (options) {
      delete options.terserOptions;
      return this.createUglifyJsPlguin(options);
    }
    return null;
  }

  createTerserMinimizer() {
    const options = this.getMinimizerOptions();
    if (options) {
      delete options.uglifyOptions;
      return this.createTerserPlugin(options);
    }
    return null;
  }

  createUglifyJsPlguin(options) {
    const opt = this.ctx.merge({
      cache: true,
      parallel: 2,
      sourceMap: !!this.ctx.devtool,
      uglifyOptions: {
        ie8: false,
        safari10: false,
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
    }, options);
    return new UglifyJsPlugin(opt);
  }

  createTerserPlugin(options) {
    const opt = this.ctx.merge({
      cache: true,
      parallel: 2,
      sourceMap: !!this.ctx.devtool,
      terserOptions: {
        ie8: false,
        safari10: false,
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
    }, options);
    return new TerserPlugin(opt);
  }

  getOptimization() {
    return this.normalizeMinimizer(this.createUglifyJsMinimizer());
  }

  getDLLOptimization() {
    this.normalizeChunks();
    return this.normalizeMinimizer(this.createUglifyJsMinimizer());
  }

  getMinChunks() {
    const webpackConfig = this.ctx.webpackConfig;
    if (this.ctx.utils.isObject(webpackConfig.entry)) {
      const count = Object.keys(webpackConfig.entry).length;
      if (count > 1) {
        return Math.ceil(count/2);
      }
    }
    return 1;
  }

  getWebOptimization() {
    const minChunks = this.getMinChunks();
    const minimizer = this.createUglifyJsMinimizer();
    const optimization = this.normalizeMinimizer(minimizer);
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
        minChunks,
        cacheGroups: {
          default: false,
          vendors: this.getCacheVendors(minChunks),
          styles: this.getCacheStyles(minChunks)
        }
      }
    }, optimization);
  }

  getNodeOptimization() {
    this.normalizeChunks();
    return this.normalizeMinimizer(process.env.BABEL_ENV ? this.createTerserMinimizer() : this.createUglifyJsMinimizer());
  }
};