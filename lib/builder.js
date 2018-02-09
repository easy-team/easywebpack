'use strict';
const path = require('path');
const fs = require('fs');
const WebpackTool = require('webpack-tool');
const merge = WebpackTool.merge;
const WebpackDllBuilder = require('./dll');
const utils = require('../utils/utils');
const baseDir = process.cwd();
exports.getBuilderConfig = (config = {}, option = {}) => {
  if (utils.isString(config)) {
    const filepath = path.isAbsolute(config) ? config : path.resolve(baseDir, config);
    if (fs.existsSync(filepath)) {
      return merge({ baseDir }, require(filepath));
    }
    return { baseDir };
  }
  if (utils.isObject(config) && (config.cli || config.entry || config.framework || config.egg || config.lib || config.dll)) {
    return merge({ baseDir }, config);
  }
  const filepath = path.join(config.baseDir || baseDir, 'webpack.config.js');
  if (fs.existsSync(filepath)) {
    return merge({ baseDir }, require(filepath), config);
  }
  return merge({ baseDir }, config);
};

// create dll manifest
exports.getDllWebpackConfig = (config, option = {}) => {
  config.baseDir = config.baseDir || baseDir;
  if (config.dll) {
    const dllWebpackConfig = [];
    const dllConfig = { env: config.env, baseDir: config.baseDir };
    const dllArray = WebpackDllBuilder.getDllConfig(config.dll);
    const alias = merge(config.alias, config.resolve && config.resolve.alias);
    const externals = config.externals;
    const publicPath = config.publicPath;
    const buildPath = config.buildPath;
    const install = config.install;
    const cdn = config.cdn;
    const configPlugins = config.plugins || {};
    const plugins = {};
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
      const builderConfig = Object.assign({}, dllConfig, { entry: {}, dll: item, publicPath, buildPath, alias, externals, install, cdn, plugins }, item.webpackConfig);
      if (option.onlyView || utils.checkDllUpdate(config, item)) {
        dllWebpackConfig.push(new WebpackDllBuilder(builderConfig).create());
      }
    });
    if (dllWebpackConfig.length) {
      return dllWebpackConfig.length === 1 ? dllWebpackConfig[0] : dllWebpackConfig;
    }
  }
  return null;
};

exports.getWebpackConfig = (config, builders, option = {}) => {
  const builderConfig = exports.getBuilderConfig(config, option);
  const type = builderConfig.type;
  const target = builderConfig.target || option && option.target;
  let webpackConfigList = [];
  if (option.onlyDll) {
    return exports.getDllWebpackConfig(builderConfig, option);
  }
  if (option.dll) {
    const dllWebpackConfig = exports.getDllWebpackConfig(builderConfig);
    if (dllWebpackConfig) {
      webpackConfigList = webpackConfigList.concat(dllWebpackConfig);
    }
  }
  builders = Array.isArray(builders) ? builders : [builders];
  builders.forEach(builder => {
    const WebpackBuilder = builder;
    // console.log('easywebpack.getWebpackConfig:',WebpackBuilder.TYPE, WebpackBuilder.TARGET, target, type);
    if ((type === undefined && target === undefined) || WebpackBuilder.TYPE === type ||
    WebpackBuilder.TARGET === target || (Array.isArray(type) && type.includes(WebpackBuilder.TYPE))) {
      webpackConfigList.push(new WebpackBuilder(builderConfig).create());
    }
  });
  return webpackConfigList.length === 1 ? webpackConfigList[0] : webpackConfigList;
};
