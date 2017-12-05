'use strict';
const path = require('path');
const fs = require('fs');
const WebpackDllBuilder = require('./dll');

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
exports.getDllWebpackConfig = config => {
  const dll = config.plugins && config.plugins.dll;
  if (dll) {
    const entryName = dll.vendorName || 'vendor';
    const entry = {};
    entry[entryName] = dll[entryName];
    const builder = new WebpackDllBuilder({ entry });
    if (!fs.existsSync(builder.getDllFilePath())) {
      return builder.create();
    }
  }
  return null;
};

exports.getWebpackConfig = (config, builders, option = {}) => {
  const builderConfig = exports.getBuilderConfig(config, option);
  const type = builderConfig.type;
  const target = option && option.target;
  const webpackConfigList = [];
  if(option.onlyDll){
    return exports.getDllWebpackConfig(builderConfig);
  }
  if (option.dll === undefined || option.dll) {
    const dllWebpackConfig = exports.getDllWebpackConfig(builderConfig);
    if (dllWebpackConfig) {
      webpackConfigList.push(dllWebpackConfig);
    }
  }
  builders.forEach(builder => {
    const WebpackBuilder = builder;
    const webpackBuilder = new WebpackBuilder(builderConfig);
    if ((type === undefined && target === undefined) || type === webpackBuilder.type
      || (webpackBuilder.options && webpackBuilder.options.target === target)
      || (Array.isArray(type) && type.includes(webpackBuilder.type))) {
      webpackConfigList.push(webpackBuilder.create());
    }
  });
  return webpackConfigList.length === 1 ? webpackConfigList[0] : webpackConfigList;
};
