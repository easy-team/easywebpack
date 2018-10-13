'use strict';
const path = require('path');
const fs = require('fs');
const WebpackTool = require('webpack-tool');
const merge = WebpackTool.merge;
const WebpackDllBuilder = require('./dll');
const utils = require('../utils/utils');
const BASE_SOLUTION = 'easywebpack';
const BASE_FRAMEWORKS = ['vue', 'react', 'html', 'js'];

exports.getFramework = baseDir => {
  const pkgFile = path.join(baseDir, 'package.json');
  const pkg = require(pkgFile);
  return BASE_FRAMEWORKS.find(framework => {
    const key = `${BASE_SOLUTION}-${framework}`;
    return pkg.dependencies[key] || pkg.devDependencies[key];
  });
};

exports.getPackageConfig = baseDir => {
  const pkgFile = path.join(baseDir, 'package.json');
  if (fs.existsSync(pkgFile)) {
    const pkg = require(pkgFile);
    return pkg.webpack || {};
  }
  return {};
};

exports.getBuilderConfig = (config = {}, option = {}) => {
  const { baseDir = process.cwd(), framework, target } = option;
  const pkgConfig = exports.getPackageConfig(baseDir);
  const baseConfig = merge(pkgConfig, { baseDir, framework, target });
  if (utils.isObject(config)) {
    const defaultWebpackFilepath = path.join(config.baseDir || baseDir, 'webpack.config.js');
    if (fs.existsSync(defaultWebpackFilepath)) {
      const fileConfig = require(defaultWebpackFilepath);
      return merge(baseConfig, fileConfig, config);
    }
  } else if (utils.isString(config)) {
    const filepath = path.isAbsolute(config) ? config : path.resolve(baseDir, config);
    if (fs.existsSync(filepath)) {
      const customFileConfig = require(filepath);
      return merge(baseConfig, customFileConfig);
    }
  }
  return merge(baseConfig, config);
};

// create dll manifest
exports.getDllWebpackConfig = (config, option = {}) => {
  config.baseDir = config.baseDir || process.cwd();
  if (config.dll) {
    const dllWebpackConfig = [];
    const dllConfig = { env: config.env, baseDir: config.baseDir };
    const dllArray = WebpackDllBuilder.getDllConfig(config.dll);
    const alias = merge(config.alias, config.resolve && config.resolve.alias);
    const externals = config.externals;
    const node = config.node;
    const publicPath = config.publicPath;
    const buildPath = config.buildPath;
    const install = config.install;
    const prefix = config.prefix;
    const resolveLoader = config.resolveLoader;
    const cdn = config.cdn;
    const cache = config.cache;
    const host = config.host;
    const configLoaders = config.loaders || {};
    const configPlugins = config.plugins || {};
    const loaders = {};
    const plugins = {};
    const cli = utils.isObject(config.cli) ? config.cli : {};
    if (utils.isObject(configLoaders) && configLoaders.typescript) {
      loaders.typescript = configLoaders.typescript;
    }
    // support cli size
    if (!Array.isArray(configPlugins)) {
      if (configPlugins.analyzer) {
        plugins.analyzer = configPlugins.analyzer;
      }
      if (configPlugins.stats) {
        plugins.stats = configPlugins.stats;
      }
    }
    dllArray.forEach(item => {
      const builderConfig = Object.assign({}, dllConfig, { host, node, cache, prefix, entry: {}, dll: item, publicPath, buildPath, alias, externals, resolveLoader, install, cdn, loaders, plugins }, item.webpackConfig);
      if (option.onlyView || cli.dll || utils.checkDllUpdate(config, item)) {
        dllWebpackConfig.push(new WebpackDllBuilder(builderConfig).create());
      }
    });
    if (dllWebpackConfig.length) {
      return dllWebpackConfig.length === 1 ? dllWebpackConfig[0] : dllWebpackConfig;
    }
  }
  return null;
};

exports.getConfig = (config, option) => {
  const easyConfig = exports.getBuilderConfig(config, option);
  // 自动检测动态设置 framework, 支持 vue,react,html,weex,js
  if (!easyConfig.framework) {
    easyConfig.framework = exports.getFramework(easyConfig.baseDir);
  }
  // 自动检测动态设置 webpack target, 默认返回 target:web 和 target:node 两个 webpack config
  if (easyConfig.target === null && (easyConfig.template || !utils.isEgg(easyConfig))) {
    easyConfig.target = 'web';
  }
  return easyConfig;
};

exports.getWebpackConfig = (config, builders, option = {}) => {
  const cli = utils.isObject(config) && utils.isObject(config.cli);
  const easyConfig = cli ? config : exports.getConfig(config, option);
  const type = easyConfig.type;
  const target = easyConfig.target || option && option.target;
  let webpackConfigList = [];
  if (option.onlyDll) {
    return exports.getDllWebpackConfig(easyConfig, option);
  }
  if (option.dll) {
    const dllWebpackConfig = exports.getDllWebpackConfig(easyConfig);
    if (dllWebpackConfig) {
      webpackConfigList = webpackConfigList.concat(dllWebpackConfig);
    }
  }
  builders = Array.isArray(builders) ? builders : [builders];
  builders.forEach(builder => {
    const WebpackBuilder = builder;
    // console.log('easywebpack.getWebpackConfig:',WebpackBuilder.TYPE, WebpackBuilder.TARGET, target, type);
    if ((type === undefined && (target === undefined || target === null)) || WebpackBuilder.TYPE === type ||
    WebpackBuilder.TARGET === target || (Array.isArray(type) && type.includes(WebpackBuilder.TYPE))) {
      webpackConfigList.push(new WebpackBuilder(easyConfig).create());
    }
  });
  return webpackConfigList.length === 1 ? webpackConfigList[0] : webpackConfigList;
};
