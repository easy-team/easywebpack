'use strict';
const webpack = require('webpack');
const merge = require('webpack-merge');
const ManifestPlugin = require('webpack-manifest-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const chalk = require('chalk');
const ConfigBase = require('./base');

class ConfigPlugin extends ConfigBase {
  constructor(config) {
    super(config);
    this.defaultPluginOption = {
      ProgressBarPlugin: {
        width: 100,
        format: 'webpack build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
        clear: false
      },
      ManifestPlugin: {
        fileName: '../config/manifest.json',
        basePath: '/'
      },
      CommonsChunkPlugin: {
        names: config.build.commonsChunk
      },
      LoaderOptionsPlugin: {
        minimize: true
      }
    };

    this.defaultPluginList = [
      {
        enable: true,
        client: true,
        server: true,
        env: ['dev', 'test', 'prod'],
        args: 'object',
        clazz: webpack.DefinePlugin
      },
      {
        enable: true,
        client: true,
        server: true,
        env: ['dev', 'test', 'prod'],
        clazz: webpack.NoEmitOnErrorsPlugin
      },
      {
        enable: true,
        client: true,
        server: true,
        env: ['dev', 'test', 'prod'],
        args: 'object',
        clazz: webpack.optimize.CommonsChunkPlugin
      },
      {
        enable: true,
        client: true,
        server: true,
        env: ['dev'],
        args: 'object',
        clazz: ProgressBarPlugin
      },
      {
        enable: true,
        client: true,
        server: false,
        env: ['dev', 'test', 'prod'],
        args: 'object',
        clazz: ManifestPlugin
      },
      {
        enable: true,
        client: false,
        server: true,
        env: ['dev', 'test', 'prod'],
        clazz: webpack.NormalModuleReplacementPlugin
      },
      {
        enable: true,
        client: true,
        server: true,
        env: ['dev', 'test', 'prod'],
        args: 'string',
        clazz: webpack.IgnorePlugin
      },
      {
        enable: true,
        client: true,
        server: false,
        env: ['dev', 'test', 'prod'],
        args: 'object',
        clazz: webpack.LoaderOptionsPlugin
      },
      {
        enable: true,
        client: true,
        server: true,
        env: ['test', 'prod'],
        args: 'object',
        clazz: webpack.optimize.UglifyJsPlugin
      },
      {
        enable: true,
        client: true,
        server: false,
        env: ['dev'],
        clazz: webpack.HotModuleReplacementPlugin
      }
    ];
  }

  getPluginOption(plugin) {
    const name = plugin.constructor && plugin.constructor.name;
    return name ? this.defaultPluginOption[name] || {} : {};
  }

  getPlugin() {
    const plugins = [];
    this.defaultPluginList.filter(plugin => {
      return plugin.enable && (this.client ? plugin.client : plugin.server) && plugin.env.includes(this.env);
    }).forEach(plugin => {
      if (plugin.clazz) {
        const args = this.defaultPluginOption[plugin.clazz.name];
        if (plugin.args && args) {
          plugins.push(new plugin.clazz(args));
        } else if (!plugin.args) {
          plugins.push(new plugin.clazz());
        }
      }
    });
    return plugins;
  }

  setOption(options) {
    this.options = merge(this.defaultPluginOption, options);
  }
}

module.exports = ConfigPlugin;

