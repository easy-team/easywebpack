'use strict';
const path = require('path').posix;
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const chalk = require('chalk');
const utils = require('../utils/utils');

exports.module = {
  enable: true,
  name: webpack.optimize.ModuleConcatenationPlugin
};

exports.error = {
  enable: true,
  name: webpack.NoEmitOnErrorsPlugin
};

exports.provide = {
  enable: true,
  name: webpack.ProvidePlugin,
  args: {}
};

exports.define = {
  enable: true,
  name: webpack.DefinePlugin,
  args: {}
};

exports.commonsChunk = {
  enable: true,
  type: 'client',
  name: webpack.optimize.CommonsChunkPlugin,
  action: 'merge',
  args() {
    const packKeys = Object.keys(this.packs || {});
    const chunks = Object.keys(this.options.entry).filter(entry => {
      return !packKeys.includes(entry);
    });
    return { names: 'vendor', chunks };
  }
};

exports.uglifyJs = {
  enable: true,
  env: ['prod'],
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
  enable: true,
  type: 'client',
  env: ['dev'],
  name: webpack.HotModuleReplacementPlugin
};

exports.manifest = {
  enable: true,
  type: 'client',
  name: 'webpack-manifest-plugin',
  args() {
    const filename = this.config.plugins.manifest && this.config.plugins.manifest.filename || 'config/manifest.json';
    const absFilename = path.posix.isAbsolute(filename) ? filename : path.posix.join(this.config.baseDir, filename);
    const relativeFileName = path.posix.relative(this.buildPath, absFilename);
    return { fileName: relativeFileName };
  }
};

exports.buildfile = {
  enable: true,
  type: 'client',
  name: require('./plugin/build-config-webpack-plugin'),
  args() {
    return {
      baseDir: this.config.baseDir,
      host: utils.getHost(this.config.port),
      proxy: this.config.proxy,
      commonsChunk: this.getCommonsChunk(),
      buildPath: this.buildPath,
      publicPath: this.publicPath
    };
  }
};

exports.progress = {
  enable: true,
  name: 'progress-bar-webpack-plugin',
  args: {
    width: 100,
    format: `webpack build [:bar] ${chalk.green.bold(':percent')} (:elapsed seconds)`,
    clear: false
  }
};

exports.imagemini = {
  enable: true,
  env: ['prod'],
  type: 'client',
  name: 'imagemin-webpack-plugin',
  entry: 'default'
};

exports.directoryname = {
  enable: true,
  name: 'directory-named-webpack-plugin'
};

exports.extract = {
  type: 'client',
  env: ['test', 'prod'],
  name: 'extract-text-webpack-plugin',
  enable() {
    return this.config.cssExtract;
  },
  args() {
    return { filename: this.config.cssName };
  }
};

exports.modulereplacement = {
  enable: true,
  type: 'server',
  env: ['test', 'prod'],
  name: webpack.NormalModuleReplacementPlugin,
  args: [/\.(css|less|scss|sass)$/, require.resolve('node-noop')]
};

exports.ignore = {
  enable: true,
  type: 'server',
  env: ['test', 'prod'],
  name: webpack.IgnorePlugin,
  args: /\.(css|less|scss|sass)$/
};

