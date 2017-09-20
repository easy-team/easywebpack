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
exports.getConfig = config => require('./lib/config')(config);

const webpackTool = new WebpackTool();
exports.build = (webpackConfig, option, callback) => {
  webpackTool.build(webpackConfig, option, callback);
};
exports.server = (webpackConfig, option, callback) => {
  webpackTool.server(webpackConfig, option, callback);
};
