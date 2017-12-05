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

exports.getWebpackConfig = config => {
  if (config.framework === 'dll') {
    return [exports.getDllWebpackConfig(config)];
  }
  if (config.framework === 'js') {
    return exports.WebpackBuilder.getWebpackConfig(config, [exports.WebpackClientBuilder]);
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
