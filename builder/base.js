'use strict';
const webpack = require('webpack');
const merge = require('webpack-merge');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const chalk = require('chalk');
const Utils = require('../utils/utils');
const Loader = require('../utils/loader');
class WebpackBaseBuilder {
  constructor(config, options) {
    this.config = config;
    this.options = options;
    this.initConfig();
    this.initOption();
    this.initConfigLoader();
    this.initConfigPlugin();
  }

  initConfig() {
    this.prod = process.env.NODE_ENV === 'production';
    this.loaders = [];
    this.plugins = [];
    this.setUglifyJs(this.prod);
    this.setFileNameHash(this.prod);
    this.setImageHash(this.prod);
    this.setCssHash(this.prod);
    this.setCssExtract(false);
  }

  initOption() {
    this.options = {
      entry: Utils.getEntry(this.config.build.entry),
      resolve: {
        extensions: ['.js']
      },
      output: {
        publicPath: this.config.build.publicPath
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        })
      ]
    };
  }

  initConfigLoader() {
    this.configLoaders = [
      {
        test: /\.js$/,
        loader: require.resolve('babel-loader'),
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: require.resolve('json-loader')
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: require.resolve('url-loader'),
        query: {
          limit: 1024
        },
        dynamic: () => {
          return {
            query: {
              name: this.imageName
            }
          }
        },
      }
    ];
    Loader.styleLoaders(this.config).forEach(loader => {
      this.configLoaders.push(loader);
    });
  }

  initConfigPlugin() {
    this.configPlugins = [
      {
        clazz: webpack.NoEmitOnErrorsPlugin
      },
      {
        clazz: ProgressBarPlugin,
        args: {
          width: 100,
          format: 'webpack build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
          clear: false
        },
      },
      {
        enable: () => {
          return this.isUglifyJS;
        },
        clazz: webpack.optimize.UglifyJsPlugin,
        args: () => {
          return {
            compress: {
              warnings: false,
              dead_code: true,
              drop_console: true,
              drop_debugger: true
            }
          }
        }
      }
    ];
  }

  setOption(option) {
    this.options = merge(this.options, option);
  }

  setPublicPath(publicPath) {
    this.options = merge(this.options, { output: { publicPath } });
  }

  setEggWebpackPublicPath() {
    if (!this.prod) {
      this.setPublicPath(Utils.getDevPublicPath(this.config, 2));
    }
  }

  setDevTool(devtool, force) {
    if (!this.prod || force) {
      this.options = merge(this.options, { devtool });
    }
  }

  setConfigLoader(loader, isHead) {
    if (isHead) {
      const tempLoader = Array.isArray(loader) ? loader : [loader];
      this.configLoaders = tempLoader.concat(this.configLoaders);
    } else {
      this.configLoaders = this.configLoaders.concat(loader);
    }
  }


  setConfigPlugin(plugin, isHead) {
    if (isHead) {
      const tempPlugin = Array.isArray(plugin) ? plugin : [plugin];
      this.configPlugins = tempPlugin.concat(this.configPlugins);
    } else {
      this.configPlugins = this.configPlugins.concat(plugin);
    }
  }

  setLoader(loader, isHead) {
    if (isHead) {
      const tempLoader = Array.isArray(loader) ? loader : [loader];
      this.loaders = tempLoader.concat(this.loaders);
    } else {
      this.loaders = this.loaders.concat(loader);
    }
  }

  setPlugin(plugin, isHead) {
    if (isHead) {
      const tempPlugin = Array.isArray(plugin) ? plugin : [plugin];
      this.plugins = tempPlugin.concat(this.plugins);
    } else {
      this.plugins = this.plugins.concat(plugin);
    }
  }

  createWebpackLoader() {
    this.configLoaders.forEach(loader => {
      if (loader.dynamic && typeof loader.dynamic === 'function') {
        const tempLoader = Object.assign({}, loader);
        const loaderConfig = tempLoader.dynamic();
        delete tempLoader.dynamic;
        this.loaders.push(merge(tempLoader, loaderConfig));
      } else {
        this.loaders.push(loader);
      }
    });
    return this.loaders;
  }

  createWebpackPlugin() {
    this.configPlugins.forEach(plugin => {
      const enable = typeof plugin.enable === 'function' ? plugin.enable() : plugin.enable || plugin.enable === undefined;
      if (enable) {
        if (plugin.args) {
          const args = typeof plugin.args === 'function' ? plugin.args() : plugin.args;
          this.plugins.push(new (Function.prototype.bind.apply(plugin.clazz, [null].concat(args)))());
        } else if (!plugin.args) {
          this.plugins.push(new plugin.clazz());
        }
      }
    });
    return this.plugins;
  }

  create() {
    this.createWebpackLoader();
    this.createWebpackPlugin();
    return this.getWebpackConfig();
  }

  getWebpackConfig() {
    return merge({
        module: {
          rules: this.loaders
        },
        plugins: this.plugins
      },
      this.options);
  }

  setUglifyJs(isUglifyJS) {
    this.isUglifyJS = isUglifyJS
  }

  setFileNameHash(isHash, len = 7) {
    if (isHash) {
      this.filename = Utils.assetsPath(this.config, `js/[name].[hash:${len}].js`);
      this.chunkFilename = Utils.assetsPath(this.config, `js/[id].[chunkhash:${len}].js`);
    } else {
      this.filename = Utils.assetsPath(this.config, 'js/[name].js');
      this.chunkFilename = Utils.assetsPath(this.config, 'js/[id].js');
    }
  }

  setImageHash(isHash, len = 7) {
    if (isHash) {
      this.imageName = Utils.assetsPath(this.config, `img/[name].[hash:${len}].[ext]`);
    } else {
      this.imageName = Utils.assetsPath(this.config, `img/[name].[ext]`);
    }
  }

  setCssHash(isHash, len = 7) {
    if (isHash) {
      this.cssName = Utils.assetsPath(this.config, `css/[name].[contenthash:${len}].css`);
    } else {
      this.cssName = Utils.assetsPath(this.config, `img/[name].css`);
    }
  }

  setCssExtract(isExtract) {
    this.config.extractCss = isExtract;
  }

  addLoader(test, loader, option) {
    this.loaders.push(merge({
      test, loader
    }, option));
  }
}

module.exports = WebpackBaseBuilder;
