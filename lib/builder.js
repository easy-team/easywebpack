'use strict';
const path = require('path');
const WebpackDllBuilder = require('./dll');
exports.getBuilderConfig = config => {
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
exports.createDllEntry = config => {
  const dll = config.plugins && config.plugins.dll;
  if (dll) {
    const entryName = dll.name || 'vendor';
    const entry = {};
    entry[entryName] = dll[entryName];
    return new WebpackDllBuilder({ entry }).create();
  }
  return null;
};

exports.getWebpackConfig = (config, builders) => {
  const webpackConfig = [];
  const builderConfig = exports.getBuilderConfig(config);
  const dllWebpackConfig = exports.createDllEntry(builderConfig);
  if (dllWebpackConfig) {
    webpackConfig.push(dllWebpackConfig);
  }
  const type = config.type;
  builders.forEach(builder => {
    const WebpackBuilder = builder;
    const webpackBuilder = new WebpackBuilder(builderConfig);
    if (type === undefined || type === webpackBuilder.type ||
      (Array.isArray(type) && type.includes(webpackBuilder.type))) {
      webpackConfig.push(webpackBuilder.create());
    }
  });
  return webpackConfig;
};
