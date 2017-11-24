'use strict';
const path = require('path');
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const chalk = require('chalk');
const utils = require('../utils/utils');

exports.npm = {
  enable: false,
  name: 'npm-install-webpack-plugin',
  args: {
    dev: true
  }
};

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

exports.nameModule = {
  enable: true,
  env: ['dev'],
  type: 'client',
  name: webpack.NamedModulesPlugin,
  args: {}
};

exports.hashModule = {
  enable: true,
  env: ['test', 'prod'],
  type: 'client',
  name: webpack.HashedModuleIdsPlugin,
  args: {}
};

exports.define = {
  enable: true,
  name: webpack.DefinePlugin,
  args(){
    return {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      EASY_IS_DEV: !!this.dev,
      EASY_IS_SERVER: !!this.ssr,
      EASY_PUBLIC_PATH: JSON.stringify(this.publicPath),
      EASY_HOST_URL: JSON.stringify(`http://${this.utils.getIp()}:${this.config.port}`)
    }
  }
};

exports.commonsChunk = {
  enable: true,
  type: 'client',
  name: webpack.optimize.CommonsChunkPlugin,
  action: 'merge',
  args() {
    const packKeys = Object.keys(this.packs || {});
    const chunks = Object.keys(this.options.entry || {}).filter(entry => {
      return !packKeys.includes(entry);
    });
    return { names: 'vendor', chunks };
  }
};

exports.runtime = {
  enable: true,
  type: 'client',
  name: webpack.optimize.CommonsChunkPlugin,
  action: 'merge',
  args() {
    const chunks = this.getCommonsChunk(false);
    return { name: 'runtime',  chunks};
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
    const absFilename = this.utils.normalizePath(filename, this.config.baseDir);
    let relativeFileName = path.relative(this.buildPath, absFilename);
    return { fileName: relativeFileName };
  }
};

exports.manifestDeps = {
  enable: false,
  type: 'client',
  name: 'webpack-manifest-resource-plugin',
  args() {
    const manifestName = this.config.plugins.manifest && this.config.plugins.manifest.filename || 'config/manifest.json';
    const absFilename = this.utils.normalizePath(manifestName, this.config.baseDir);
    const fileName = path.relative(this.buildPath, absFilename);
    const commonsChunk = this.getCommonsChunk();
    return {
      baseDir: this.config.baseDir,
      proxy: this.config.proxy,
      host: utils.getHost(this.config.port),
      buildPath: this.buildPath,
      writeToFileEmit: this.dev,
      commonsChunk,
      fileName
    };
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

exports.html = {
  enable: true,
  type: 'client',
  name: 'html-webpack-plugin',
  args: {
    inject: true,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true
    }
  }
};