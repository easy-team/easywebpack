'use strict';
const path = require('path').posix;
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
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
    return this.config.plugin.provide;
  }
};

exports.define = {
  name: webpack.DefinePlugin,
  args() {
    return this.config.plugin.define;
  }
};

exports.commonsChunk = {
  type: 'client',
  enable: true,
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
  type: 'client',
  env: ['dev'],
  name: webpack.HotModuleReplacementPlugin
};

exports.manifest = {
  type: 'client',
  name: 'webpack-manifest-plugin',
  args() {
    const manifest = this.config.plugin.manifest && this.config.plugin.manifest.name || 'config/manifest.json';
    const manifestPath = path.isAbsolute(manifest) ? manifest : path.join(this.config.baseDir, manifest);
    const fileName = path.relative(this.buildPath, manifestPath);
    return { fileName };
  }
};

exports.buildfile = {
  type: 'client',
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
  env: ['prod'],
  type: 'client',
  name: 'imagemin-webpack-plugin',
  entry: 'default'
};

exports.directoryname = {
  name: 'directory-named-webpack-plugin'
};

exports.extract = {
  type: 'client',
  env: ['test', 'prod'],
  name: 'extract-text-webpack-plugin',
  enable() {
    return !this.dev && Utils.isTrue(this.config.extract);
  },
  args() {
    return { filename: this.config.cssName };
  }
};

exports.modulereplacement = {
  enable: false,
  name: webpack.NormalModuleReplacementPlugin,
  args: [/\.css$/, require.resolve('node-noop')]
};

exports.ignore = {
  type: 'server',
  name: webpack.IgnorePlugin,
  args: /\.(css|less|scss|sass)$/
};
