'use strict';
const path = require('path');
const fs = require('fs');
const WebpackTool = require('webpack-tool');
const merge = WebpackTool.merge;
const WebpackDllBuilder = require('./dll');
const utils = require('../utils/utils');
const baseDir = process.cwd();
exports.getBuilderConfig = (config, option) => {
  if (!config) {
    return require(path.join(baseDir, 'webpack.config.js'));
  }
  if (typeof config === 'string') {
    config = path.isAbsolute(config) ? config : require(path.join(baseDir, config));
  }
  config.baseDir = config.baseDir || baseDir;
  return config;
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
    dllArray.forEach(item => {
      const builderConfig = Object.assign({}, dllConfig, { entry: {}, dll: item, publicPath, buildPath, alias, externals, install, cdn }, item.webpackConfig);
      if (option.onlyView || utils.checkDllUpdate(config, item)) {
        dllWebpackConfig.push(new WebpackDllBuilder(builderConfig).create());
      }
    });
    if (dllWebpackConfig.length) {
      return dllWebpackConfig;
    }
  }
  return null;
};

exports.getWebpackConfig = (config, builders, option = {}) => {
  const builderConfig = exports.getBuilderConfig(config, option);
  const type = builderConfig.type;
  const target = option && option.target;
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
