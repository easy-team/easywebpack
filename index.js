'use strict';

const WebpackTool = require('webpack-tool');
exports.WebpackTool = WebpackTool;
exports.webpack = require('webpack');
exports.merge = require('webpack-merge');
exports.ProgressBarPlugin = require('progress-bar-webpack-plugin');
exports.StatsPlugin = require('stats-webpack-plugin');
exports.ManifestPlugin = require('webpack-manifest-plugin');
exports.ExtractTextPlugin = require('extract-text-webpack-plugin');
exports.Utils = require('./utils/utils');
exports.Loader = require('./utils/loader');
exports.WebpackBuilder = require('./lib/builder');
exports.WebpackBaseBuilder = require('./lib/base');
exports.WebpackClientBuilder = require('./lib/client');
exports.WebpackServerBuilder = require('./lib/server');
exports.getConfig = config => require('./lib/config')(config);

const webpackTool = new WebpackTool();
exports.build = (webpackConfig, callback) => {
  webpackTool.build(webpackConfig, callback);
};
exports.server = webpackConfig => {
  webpackTool.server(webpackConfig);
};
