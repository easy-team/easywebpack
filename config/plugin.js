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
    this.configPlugins = [
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
        args: () => {
          return this.cssName
        },
        clazz: ExtractTextPlugin
      },
      {
        enable: true,
        client: true,
        server: false,
        env: ['dev', 'test', 'prod'],
        args: () => {
          return {
            names: this.config.build.commonsChunk
          }
        },
        clazz: webpack.optimize.CommonsChunkPlugin
      },
      {
        enable: true,
        client: true,
        server: true,
        env: ['dev', 'test', 'prod'],
        args: {
          width: 100,
          format: 'webpack build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
          clear: false
        },
        clazz: ProgressBarPlugin
      },
      {
        enable: true,
        client: true,
        server: false,
        env: ['dev', 'test', 'prod'],
        args: {
          fileName: '../config/manifest.json',
          basePath: '/'
        },
        clazz: ManifestPlugin
      },
      {
        enable: true,
        client: false,
        server: true,
        env: ['dev', 'test', 'prod'],
        args: [/\.css$/, 'node-noop'],
        clazz: webpack.NormalModuleReplacementPlugin
      },
      {
        enable: true,
        client: false,
        server: true,
        env: ['dev', 'test', 'prod'],
        args: /\.(css|less|scss|sass)$/,
        clazz: webpack.IgnorePlugin
      },
      {
        enable: true,
        client: true,
        server: false,
        env: ['dev', 'test', 'prod'],
        args: () => {
          return {
            minimize: this.minimize
          }
        },
        clazz: webpack.LoaderOptionsPlugin
      },
      {
        enable: true,
        client: true,
        server: true,
        env: ['test', 'prod'],
        args: () => {
          return {
            compress: {
              warnings: false,
              dead_code: true,
              drop_console: true,
              drop_debugger: true
            }
          }
        },
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

  getPluginByName(name) {
    return this.configPlugins.filter(item => {
      return item.clazz === name;
    });
  }

  setPluginEnable(name, enable) {
    this.getPluginByName(name).forEach(item => {
      item.enable = enable;
    });
  }

  getWebpackPlugin() {
    const plugins = [];
    this.configPlugins.filter(plugin => {
      return plugin.enable && (this.config.isServer ? plugin.server : plugin.client) && plugin.env.includes(this.config.env);
    }).forEach(plugin => {
      if (plugin.clazz) {
        if (plugin.args) {
          const args = typeof plugin.args === 'function' ? plugin.args() : plugin.args;
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

