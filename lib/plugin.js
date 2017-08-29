'use strict';
const path = require('path').posix;
const webpack = require('webpack');
const chalk = require('chalk');
const Utils = require('../utils/utils');
exports.module = {
  name: webpack.optimize.ModuleConcatenationPlugin
};

exports.error = {
  name: webpack.NoEmitOnErrorsPlugin
};

exports.provide = {
  name: webpack.ProvidePlugin,
  args() {
    return this.config.provides;
  }
};

exports.define = {
  name: webpack.DefinePlugin,
  args() {
    return this.config.defines;
  }
};

exports.commonChunk = {
  enable: false,
  name: webpack.optimize.CommonsChunkPlugin,
  args() {
    const packKeys = Object.keys(this.packs);
    const chunks = Object.keys(this.options.entry).filter(entry => {
      return !packKeys.includes(entry);
    });
    return { names: this.config.commonsChunk, chunks };
  }
};

exports.uglifyJs = {
  env: ['test', 'prod'],
  name: webpack.optimize.UglifyJsPlugin,
  args: {
    compress: {
      warnings: false,
      dead_code: true,
      drop_console: true,
      drop_debugger: true
    }
  }
};

exports.hot = {
  enable: false,
  env: ['dev'],
  name: webpack.HotModuleReplacementPlugin
};

exports.manifest = {
  name: 'webpack-manifest-plugin',
  args() {
    const manifest = this.config.manifest && this.config.manifest.name || 'config/manifest.json';
    const manifestPath = path.isAbsolute(manifest) ? manifest : path.join(this.config.baseDir, manifest);
    const fileName = path.relative(this.buildPath, manifestPath);
    return { fileName };
  }
};

exports.buildfile = {
  name: require('./plugin/build-config-webpack-plugin'),
  args() {
    return {
      baseDir: this.config.baseDir,
      host: Utils.getHost(this.config.port),
      proxy: this.config.proxy,
      commonsChunk: this.config.commonsChunk,
      buildPath: this.buildPath,
      publicPath: this.publicPath
    };
  }
};

exports.progress = {
  name: 'progress-bar-webpack-plugin',
  args: {
    width: 100,
    format: `webpack build [:bar] ${chalk.green.bold(':percent')} (:elapsed seconds)`,
    clear: false
  }
};

exports.imagemini = {
  env: ['test', 'prod'],
  name: 'imagemin-webpack-plugin',
  require: 'default'
};

exports.directoryname = {
  name: 'directory-named-webpack-plugin'
};

exports.extractcss = {
  enable: false,
  env: ['test', 'prod'],
  name: 'extract-text-webpack-plugin'
};
