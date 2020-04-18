'use strict';
const path = require('path');
const fs = require('fs');
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const chalk = require('chalk');
const utils = require('../utils/utils');

exports.hot = {
  enable: true,
  type: 'client',
  env: ['dev'],
  name: webpack.HotModuleReplacementPlugin
};

exports.npm = {
  enable: false,
  name: 'npm-install-webpack-plugin',
  args: {
    dev: true
  }
};

exports.provide = {
  enable: true,
  name: webpack.ProvidePlugin,
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

exports.manifest = {
  enable: true,
  type: 'client',
  name: 'webpack-manifest-resource-plugin',
  args() {
    const args = {
      baseDir: this.baseDir,
      host: this.host,
      proxy: this.proxy,
      buildPath: this.buildPath,
      publicPath: this.publicPath,
      localPublicPath: this.config.publicPath,
      assets: false,
      writeToFileEmit: true
    };
    const manifestConfig = this.getConfigPlugin('manifest') || {};
    const configManifestFileName = manifestConfig.fileName || (manifestConfig.args && manifestConfig.args.fileName);
    const manifestName = configManifestFileName || (this.egg ? 'config/manifest.json' : 'manifest.json');
    const manifestDir = this.egg ? this.baseDir : this.buildPath;
    const filepath = path.join(manifestDir, manifestName);
    // 兼容旧 manifest 配置
    const fileName = path.relative(this.config.buildPath, filepath);
    const dllConfig = utils.getDllConfig(this.config.dll);
    const dllDir = utils.getDllManifestDir(this.env);
    const dllChunk = this.getDLLChunk();
    const commonsChunk = this.getCommonsChunk();
    // 如果开启了dll 功能, 则读取 dll manifest 配置, 然后与项目 manifest 合并
    if (dllConfig.length) {
      return this.merge(args, {
        dllDir,
        filepath,
        fileName,
        dllConfig,
        dllChunk,
        commonsChunk
      });
    }
    return this.merge(args, {
      filepath,
      fileName,
      commonsChunk
    });
  }
};

exports.manifestDll = {
  enable: false,
  type: 'client',
  name: 'webpack-manifest-resource-plugin',
  args() {
    const dllConfig = this.config.dll || {};
    const filepath = this.utils.getDllManifestPath(dllConfig.name, this.env);
    return {
      baseDir: this.baseDir,
      proxy: this.proxy,
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
    const prefix = this.dll ? 'dll' : this.type;
    return {
      analyzerPort: this.dll ? 9997 : this.ssr ? 9998 : 9999,
      statsFilename: prefix ? prefix + '_analyzer_stats.json' : 'analyzer_stats.json'
    };
  }
};

exports.stats = {
  enable: false,
  name: 'stats-webpack-plugin',
  args() {
    const prefix = this.dll ? 'dll' : this.type;
    const args = [{
      chunkModules: true,
      exclude: [/node_modules[\\\/]/]
    }];
    args.unshift(prefix ? prefix + '_stats.json' : 'stats.json');
    return args;
  }
};

exports.directoryname = {
  enable: false,
  name: 'directory-named-webpack-plugin'
};

exports.extract = {
  type: 'client',
  name: 'mini-css-extract-plugin',
  env: ['test', 'prod'],
  args() {
    return {
      filename: this.webpackInfo.cssName,
      chunkFilename: this.webpackInfo.cssChunkName
    };
  }
};


exports.modulereplacement = {
  enable() {
    return this.isUsePlugin('extract', false);
  },
  type: 'server',
  name: webpack.NormalModuleReplacementPlugin,
  args: [/\.(css|less|scss|sass|styl|stylus)$/, require.resolve('node-noop')]
};

exports.ignore = {
  enable() {
    return this.isUsePlugin('extract', false);
  },
  type: 'server',
  name: webpack.IgnorePlugin,
  args: /\.(css|less|scss|sass|styl|stylus)$/
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

exports.tschecker = {
  enable: false,
  type: 'client',
  name: 'fork-ts-checker-webpack-plugin',
  args() {
    const filepath = path.resolve(this.baseDir, this.egg ? 'app/web/tsconfig.json' : 'tsconfig.json');
    const arg = {
      silent: true,
      memoryLimit: 512,
      checkSyntacticErrors: true
    };
    if (fs.existsSync(filepath)) {
      arg.tsconfig = filepath;
    }
    return arg;
  }
};

exports.clean = {
  enable: true,
  env: ['test', 'prod'],
  type: 'client',
  name: 'clean-webpack-plugin',
  args() {
    const dist = path.relative(this.baseDir, this.buildPath);
    const dirs = [dist];
    const options = { root: this.baseDir };
    return [dirs, options];
  }
};

exports.cssmini = {
  enable: true,
  env: 'prod',
  type: 'client',
  name: 'optimize-css-assets-webpack-plugin'
};

exports.case = {
  enable: true,
  name: 'case-sensitive-paths-webpack-plugin',
  args: {}
};

exports.copy = {
  enable: false,
  type: 'client',
  name: 'copy-webpack-plugin'
};

exports.write = {
  enable: true,
  env: ['dev'],
  type: 'client',
  name: 'write-file-webpack-plugin',
  args: {
    test: /\.(tpl|html)$/
  }
};

exports.filter = {
  enable: true,
  name: 'webpack-filter-warnings-plugin',
  args: {
    exclude: /\[mini-css-extract-plugin]\nConflicting order/
  }
};

exports.vconsole = {
  enable: false,
  type: 'client',
  name: 'vconsole-webpack-plugin',
  args() {
    const enable = ['dev', 'test'].indexOf(this.env) > -1;
    return { enable };
  }
};