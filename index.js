'use strict';

const WebpackTool = require('webpack-tool');
exports.WebpackTool = WebpackTool;
exports.webpack = require('webpack');
exports.merge = require('webpack-merge');
exports.Utils = require('./utils/utils');
exports.WebpackBuilder = require('./lib/builder');
exports.WebpackBaseBuilder = require('./lib/base');
exports.WebpackClientBuilder = require('./lib/client');
exports.WebpackServerBuilder = require('./lib/server');
exports.WebpackDllBuilder = require('./lib/dll');
exports.getConfig = config => require('./lib/config')(config);

const webpackTool = new WebpackTool();

exports.getWebpackConfig = (config, option = {}) => {
  if (config.framework === 'dll' || option.onlyDll) {
    return exports.getDllWebpackConfig(config, option);
  }
  if (config.framework === 'js') {
    return exports.WebpackBuilder.getWebpackConfig(config, [exports.WebpackClientBuilder]);
  }
  if (config.framework === 'web'|| option.onlyWeb) {
    return exports.WebpackBuilder.getWebpackConfig(config, [exports.WebpackClientBuilder]);
  }
  if (config.framework === 'node'|| option.onlyNode) {
    return exports.WebpackBuilder.getWebpackConfig(config, [exports.WebpackServerBuilder]);
  }
  return exports.WebpackBuilder.getWebpackConfig(config, [exports.WebpackClientBuilder, exports.WebpackServerBuilder]);
};

exports.getDllWebpackConfig = (config, option = {}) => {
  if (option.singleConfig) {
    return new exports.WebpackDllBuilder(config).create();
  } else {
    return exports.WebpackBuilder.getDllWebpackConfig(config);
  }
};

exports.build = (webpackConfig, option, callback) => {
  webpackTool.build(webpackConfig, option, callback);
};
exports.server = (webpackConfig, option, callback) => {
  webpackTool.server(webpackConfig, option, callback);
};
