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
    return [exports.getWebpackDllConfig(config)];
  }
  if (config.framework === 'js') {
    return exports.WebpackBuilder.getWebpackConfig(config, [exports.WebpackClientBuilder]);
  }
  return exports.WebpackBuilder.getWebpackConfig(config, [exports.WebpackClientBuilder, exports.WebpackServerBuilder]);
};

exports.getWebpackDllConfig = config => {
  return new exports.WebpackDllBuilder(config).create();
};

exports.build = (webpackConfig, option, callback) => {
  webpackTool.build(webpackConfig, option, callback);
};
exports.server = (webpackConfig, option, callback) => {
  webpackTool.server(webpackConfig, option, callback);
};
