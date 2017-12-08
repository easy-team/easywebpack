'use strict';
const path = require('path');
const fs = require('fs');
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
  args() {
    const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : (this.prod ? 'production' : 'development');
    return {
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      EASY_IS_DEV: !!this.dev,
      EASY_IS_PROD: !!this.prod,
      EASY_IS_NODE: !!this.ssr,
      EASY_PUBLIC_PATH: JSON.stringify(this.publicPath),
      EASY_HOST_URL: JSON.stringify(`http://${this.utils.getIp()}:${this.config.port}`)
    };
  }
};

exports.commonsChunk = {
  enable() {
    return this.config.plugins.commonsChunk || !this.config.dll;
  },
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
  enable() {
    return this.config.plugins.commonsChunk || !this.config.dll;
  },
  type: 'client',
  name: webpack.optimize.CommonsChunkPlugin,
  action: 'merge',
  args() {
    const chunks = this.getCommonsChunk(false);
    return { name: 'runtime', chunks };
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
    const filename = this.config.plugins && this.config.plugins.manifest && this.config.plugins.manifest.filename || 'config/manifest.json';
    const absFilename = this.utils.normalizePath(filename, this.baseDir);
    const relativeFileName = path.relative(this.buildPath, absFilename);
    return { fileName: relativeFileName };
  }
};

exports.manifestDll = {
  enable: false,
  type: 'client',
  name: 'webpack-manifest-resource-plugin',
  args() {
    const dllConfig = this.config.dll || {};
    const filepath = this.getCompileTempDir(`config/manifest-${dllConfig.name}.json`);
    return {
      baseDir: this.baseDir,
      proxy: this.proxy,
      host: this.host,
      buildPath: this.buildPath,
      assets: false,
      manifestDll: true,
      writeToFileEmit: true,
      dllConfig,
      filepath
    };
  }
};

exports.manifestDeps = {
  enable: false,
  type: 'client',
  name: 'webpack-manifest-resource-plugin',
  args() {
    const args = {
      baseDir: this.baseDir,
      proxy: this.proxy,
      host: this.host,
      buildPath: this.buildPath,
      assets: false,
      writeToFileEmit: true
    };
    const dllConfig = this.config.dll;
    const plugins = this.config.plugins || {};
    const manifest = plugins.manifestDeps || {};
    const filepath = path.join(this.baseDir, manifest.fileName || 'config/manifest.json') ;
    // 如果开启了dll 功能, 则读取 dll manifest 配置, 然后与项目 manifest 合并
    if (dllConfig) {
      return this.merge(args, { filepath, dllConfig, dllDir: this.getCompileTempDir() });
    }
    return this.merge(args, { filepath, commonsChunk: this.getCommonsChunk() });
  }
};


exports.buildfile = {
  enable: true,
  type: 'client',
  name: require('./plugin/build-config-webpack-plugin'),
  args() {
    return {
      baseDir: this.baseDir,
      host: this.host,
      proxy: this.proxy,
      buildPath: this.buildPath,
      publicPath: this.publicPath,
      commonsChunk: this.getCommonsChunk(),
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

exports.analyzer = {
  enable: false,
  name: 'webpack-bundle-analyzer',
  entry: 'BundleAnalyzerPlugin',
  args() {
    return {
      analyzerPort: this.ssr ? 9998 : 9999,
      statsFilename: this.type ? this.type + '_analyzer_stats.json' : 'analyzer_stats.json'
    };
  }
};

exports.stats = {
  enable: false,
  name: 'stats-webpack-plugin',
  args() {
    const args = [{
      chunkModules: true,
      exclude: [/node_modules[\\\/]/]
    }];
    args.unshift(this.type ? this.type + '_stats.json' : 'stats.json');
    return args;
  }
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