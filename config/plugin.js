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
      ExtractTextPlugin: this.cssName,
      CommonsChunkPlugin: {
        names: config.build.commonsChunk
      },
      LoaderOptionsPlugin: {
        minimize: true
      },
      NormalModuleReplacementPlugin: [/\.css$/, 'node-noop']
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
        server: false,
        env: ['dev', 'test', 'prod'],
        args: 'string',
        clazz: ExtractTextPlugin
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
        env: ['dev', 'test', 'prod'],
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
        args: 'array',
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

  setExtractTextPluginEnable(isEnable) {
    this.setPluginEnable(ExtractTextPlugin, isEnable)
  }

  getPluginByName(name) {
    return this.defaultPluginList.filter(item => {
      return item.clazz === name;
    });
  }

  setPluginEnable(name, enable) {
    this.getPluginByName(name).forEach(item => {
      item.enable = enable;
    });
  }

  getPlugin() {
    const plugins = [];
    this.defaultPluginList.filter(plugin => {
      return plugin.enable && (this.isServer ? plugin.server : plugin.client) && plugin.env.includes(this.env);
    }).forEach(plugin => {
      if (plugin.clazz) {
        const args = this.defaultPluginOption[plugin.clazz.name];
        if (plugin.args && args) {
          plugins.push(new (Function.prototype.bind.apply(plugin.clazz, [null].concat(args)))());
        } else if (!plugin.args) {
          plugins.push(new plugin.clazz());
        }
      }
    });
    return plugins;
  }
}

module.exports = ConfigPlugin;

