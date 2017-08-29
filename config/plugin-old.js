'use strict';
const path = require('path').posix;
const webpack = require('webpack');
const merge = require('webpack-merge');
const chalk = require('chalk');
const ManifestPlugin = require('webpack-manifest-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const DirectoryNamedWebpackPlugin = require('directory-named-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const StatsPlugin = require('stats-webpack-plugin');
const Utils = require('../utils/utils');

class WebpackPlugin {
  initPlugin() {
    this.addPlugin(DirectoryNamedWebpackPlugin, null);
    this.addPlugin(webpack.optimize.ModuleConcatenationPlugin, null);
    this.addPlugin(webpack.NoEmitOnErrorsPlugin, null);
    this.addPlugin(webpack.DefinePlugin, () => {
      return this.config.defines;
    }, true, false);
    this.addPlugin(webpack.LoaderOptionsPlugin, () => {
      return this.config.loaderOption;
    });
    this.addPlugin(ProgressBarPlugin, () => {
      const defaultOption = {
        width: 100,
        format: `webpack build [:bar] ${chalk.green.bold(':percent')} (:elapsed seconds)`,
        clear: false
      };
      return merge(defaultOption, this.config.pluginOption.progress);
    });
    this.addPlugin(StatsPlugin, () => {
      const name = this.type ? `${this.type}_stats.json` : 'stats.json';
      const params = [name];
      const defaultOption = {
        chunkModules: true,
        chunks: true,
        assets: true,
        modules: true,
        children: true,
        chunksSort: true,
        assetsSort: true
      };
      params.push(Utils.isObject(this.config.pluginOption.stat) ? merge(defaultOption, this.config.pluginOption.stat) : defaultOption);
      return params;
    }, () => {
      return this.config.pluginOption.stat && this.dev;
    });
  }

  addPlugin(clazz, args, enable, replace = true) {
    const plugin = { clazz, args, enable };
    const pluginIndex = this.findPluginIndex(clazz);
    if (replace && pluginIndex > -1) {
      this.configPlugin[pluginIndex] = plugin;
    } else {
      this.configPlugin.push(plugin);
    }
  }

  findPluginIndex(plugin) {
    const pluginName = Utils.isString(plugin) ? plugin : Utils.isObject(plugin) ? plugin.constructor && plugin.constructor.name : plugin.name;
    return this.configPlugin.findIndex(item => {
      const configPlugin = item.clazz || /* istanbul ignore next */ item;
      const itemPluginName = Utils.isObject(configPlugin) ? configPlugin.constructor && configPlugin.constructor.name : configPlugin.name;
      return itemPluginName === pluginName;
    });
  }

  updatePlugin(plugin, args) {
    const pluginIndex = this.findPluginIndex(plugin);
    if (pluginIndex > -1) {
      return this.configPlugin[pluginIndex] = { clazz: plugin, args };
    }
    return null;
  }

  deletePlugin(plugin) {
    const pluginIndex = this.findPluginIndex(plugin);
    if (pluginIndex > -1) {
      return this.configPlugin.splice(pluginIndex, 1);
    }
    return null;
  }

  addImageminPlugin(miniImage) {
    this.addPlugin(ImageminPlugin, () => {
      const defaultOption = {
        pngquant: {
          quality: '90'
        }
      };
      return Utils.isObject(miniImage) ? merge(defaultOption, miniImage) : defaultOption;
    }, !!miniImage);
  }

  addUglifyJsPlugin(miniJs) {
    this.addPlugin(webpack.optimize.UglifyJsPlugin, () => {
      const defaultOption = {
        compress: {
          warnings: false,
          dead_code: true,
          drop_console: true,
          drop_debugger: true
        }
      };
      return Utils.isObject(miniJs) ? merge(defaultOption, miniJs) : defaultOption;
    }, !!miniJs);
  }

  addManifest() {
    this.addPlugin(ManifestPlugin, () => {
      const manifest = this.config.manifest && this.config.manifest.name || 'config/manifest.json';
      const manifestPath = path.isAbsolute(manifest) ? manifest : path.join(this.config.baseDir, manifest);
      const fileName = path.relative(this.buildPath, manifestPath);
      return { fileName };
    }, this.config.manifest);
  }

  createWebpackPlugin() {
    const webpackPlugins = [];
    this.configPlugin.forEach(plugin => {
      if (plugin.enable === undefined || plugin.enable === true || (Utils.isFunction(plugin.enable) && plugin.enable())) {
        if (Utils.isObject(plugin.clazz)) {
          webpackPlugins.push(plugin.clazz);
        } else if (plugin.args) {
          const args = Utils.isFunction(plugin.args) ? plugin.args() : plugin.args;
          webpackPlugins.push(new (Function.prototype.bind.apply(plugin.clazz, [null].concat(args)))());
        } else if (!plugin.args) {
          const Clazz = plugin.clazz;
          webpackPlugins.push(new Clazz());
        }
      }
    });
    // this.logger.plugin(webpackPlugins);
    return webpackPlugins;
  }
}

module.exports = WebpackPlugin;