'use strict';
const path = require('path');
const WebpackTool = require('webpack-tool');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const StatsPlugin = require('stats-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const utils = require('../lib/utils');

exports.getWebpackConfig = cfg => {
  const { baseDir, cli } = cfg;
  const { filename = 'webpack.config.js' } = cli;
  const nativeWebpackConfigFile = path.isAbsolute(filename) ? filename : path.resolve(baseDir, filename);
  return require(nativeWebpackConfigFile);
};

exports.isRegisterPlugin = (plugins, name) => {
  return plugins.some(plugin => {
    return plugin.constructor && plugin.constructor.name === name;
  });
};

exports.normalizeWebpackConfig = cfg => {
  const webpackConfig = exports.getWebpackConfig(cfg);
  const { cli } = cfg;
  const { env, size, speed } = cli;
  const { plugins = [] } = webpackConfig;

  if (!webpackConfig.mode) {
    webpackConfig.mode = env === 'prod' ? 'production' : 'development';
  }

  if (!exports.isRegisterPlugin(plugins, 'ProgressBarPlugin')) {
    plugins.push(new ProgressBarPlugin());
  }

  if (size) {
    if (size === 'stats' && !exports.isRegisterPlugin(plugins, 'StatsPlugin')) {
      plugins.push(new StatsPlugin('stats.json', {
        chunkModules: true,
        exclude: [/node_modules[\\\/]react/]
      }));
    } else if (!exports.isRegisterPlugin(plugins, 'BundleAnalyzerPlugin')) {
      plugins.push(new BundleAnalyzerPlugin());
    }
  }

  webpackConfig.plugins = plugins;

  if (speed) {
    return utils.createSpeedWebpackConfig(webpackConfig);
  }

  return webpackConfig;
};

exports.build = async (cfg) => {
  const webpackTool = new WebpackTool();
  const webpackConfig = exports.normalizeWebpackConfig(cfg);
  return webpackTool.build(webpackConfig);
};

exports.server = async (cfg) => {
  const { port } = cfg.cli;
  const webpackTool = new WebpackTool({ port });
  const webpackConfig = exports.normalizeWebpackConfig(cfg);
  return webpackTool.server(webpackConfig);
};