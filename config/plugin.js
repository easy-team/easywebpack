'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const chalk = require('chalk');
const utils = require('../utils/utils');
const WORKERS = os.cpus().length - 1;
const UGLIFYJS_WORKERS = WORKERS > 8 ? 8 : WORKERS;
exports.npm = {
  enable: false,
  name: 'npm-install-webpack-plugin',
  args: {
    dev: true
  }
};

exports.module = {
  enable: true,
  env: ['test', 'prod'],
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
      EASY_ENV: JSON.stringify(this.env),
      EASY_ENV_IS_DEV: !!this.dev,
      EASY_ENV_IS_TEST: !!this.test,
      EASY_ENV_IS_PROD: !!this.prod,
      EASY_ENV_IS_BROWSER: !(!!this.ssr),
      EASY_ENV_IS_NODE: !!this.ssr,
      EASY_ENV_LOCAL_PUBLIC_PATH: JSON.stringify(this.config.publicPath),
      EASY_ENV_PUBLIC_PATH: JSON.stringify(this.publicPath),
      EASY_ENV_HOST_URL: JSON.stringify(`${this.host}`)
    };
  }
};

exports.commonsChunk = {
  enable: true,
  type: 'client',
  name: webpack.optimize.CommonsChunkPlugin,
  action: 'merge',
  args() {
    const packKeys = Object.keys(this.packs || {});
    const chunks = Object.keys(this.webpackConfig.entry || {}).filter(entry => {
      return !packKeys.includes(entry);
    });
    const lib = this.utils.isObject(this.config.lib) ? this.config.lib : {};
    const names = lib.name || 'common';
    return { names, chunks };
  }
};

exports.runtime = {
  enable() {
    return !this.config.dll && this.isUse('commonsChunk');
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
  name: 'uglifyjs-webpack-plugin',
  args: {
    parallel: UGLIFYJS_WORKERS,
    uglifyOptions: {
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
    const relativeFileName = path.relative(this.config.buildPath, absFilename);
    return { fileName: relativeFileName };
  }
};

exports.manifestDll = {
  enable: false,
  type: 'client',
  name: 'webpack-manifest-resource-plugin',
  args() {
    const dllConfig = this.config.dll || {};
    const filepath = utils.getCompileTempDir(`${this.env}/config/manifest-${dllConfig.name}.json`);
    return {
      baseDir: this.baseDir,
      proxy: this.config.proxy,
      host: this.host,
      buildPath: this.buildPath,
      publicPath: this.publicPath,
      localPublicPath: this.config.publicPath,
      assets: false,
      manifestDll: true,
      writeToFileEmit: true,
      dllConfig,
      filepath
    };
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
      proxy: this.config.proxy,
      buildPath: this.buildPath,
      publicPath: this.publicPath,
      localPublicPath: this.config.publicPath,
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
  enable() {
    return this.config.cssExtract;
  },
  type: 'server',
  name: webpack.NormalModuleReplacementPlugin,
  args: [/\.(css|less|scss|sass)$/, require.resolve('node-noop')]
};

exports.ignore = {
  enable() {
    return this.config.cssExtract;
  },
  type: 'server',
  name: webpack.IgnorePlugin,
  args: /\.(css|less|scss|sass)$/
};

exports.html = {
  enable: true,
  type: 'client',
  name: 'html-webpack-plugin',
  args: {
    inject: true
  }
};

exports.serviceworker = {
  enable: false,
  type: 'client',
  name: 'service-worker-precache-webpack-plugin',
  args() {
    return {
      env: this.env,
      hash: this.test || this.prod,
      minify: this.prod,
      localPublicPath: this.config.publicPath
    };
  }
};