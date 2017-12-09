'use strict';
const path = require('path');
const fs = require('fs');
const WebpackDllBuilder = require('./dll');
const utils = require('../utils/utils');
exports.getBuilderConfig = (config, option) => {
  const baseDir = process.cwd();
  if (!config) {
    return require(path.join(baseDir, 'webpack.config.js'));
  }
  if (typeof config === 'string') {
    config = path.isAbsolute(config) ? config : require(path.join(baseDir, config));
  }
  return config;
};

// create dll manifest
exports.getDllWebpackConfig = (config, option = {}) => {
  if (config.dll) {
    const dllArray = Array.isArray(config.dll) ? config.dll : [config.dll];
    const dllWebpackConfig = [];
    const dllConfig = { env: config.env, baseDir: config.baseDir};
    dllArray.forEach(item => {
      const builderConfig = Object.assign({}, dllConfig, { entry: {}, dll: item }, item.options);
      builderConfig.entry[item.name] = item.lib;
      if (option.onlyView || !fs.existsSync(WebpackDllBuilder.getDllFilePath(item.name))) {
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
  const webpackConfigList = [];
  if (option.onlyDll) {
    return exports.getDllWebpackConfig(builderConfig, option);
  }
  if (option.dll === undefined || option.dll) {
    const dllWebpackConfig = exports.getDllWebpackConfig(builderConfig);
    if (dllWebpackConfig) {
      webpackConfigList.push(dllWebpackConfig);
    }
  }
  builders.forEach(builder => {
    const WebpackBuilder = builder;
    // console.log('easywebpack.getWebpackConfig:',WebpackBuilder.TYPE, WebpackBuilder.TARGET, target, type);
    if ((type === undefined && target === undefined)
      || WebpackBuilder.TYPE === type
      || WebpackBuilder.TARGET === target
      || (Array.isArray(type) && type.includes(WebpackBuilder.TYPE))) {
      webpackConfigList.push(new WebpackBuilder(builderConfig).create());
    }
  });
  return webpackConfigList.length === 1 ? webpackConfigList[0] : webpackConfigList;
};
