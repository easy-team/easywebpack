'use strict';
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const webpack = require('webpack');
const merge = require('webpack-merge');
const ManifestPlugin = require('webpack-manifest-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const StatsPlugin = require('stats-webpack-plugin');
const chalk = require('chalk');
const Logger = require('./logger');
const Utils = require('../utils/utils');
const Loader = require('../utils/loader');
const Config = require('./config');

class WebpackBaseBuilder {
  constructor(config = {}) {
    this.webpack = webpack;
    this.merge = merge;
    this.options = {};
    this.loaders = [];
    this.plugins = [];
    this.packs = {};
    this.logger = new Logger(config.logger, this);
    this.config = Config.defaultConfig;
    this.initEnv(config);
    this.initConfig(config);
    this.initialize();
    this.initLoader();
    this.initPlugin();
    this.setExtensions(['.js', '.jsx']);
    this.logger.env();
  }

  initLoader() {
    this.addLoader(/\.jsx?$/, 'babel-loader', { exclude: /node_modules/ }, () => {
      return this.config.loaderOption.babel;
    });
    this.addLoader(/\.json$/, 'json-loader', { exclude: /node_modules/ }, () => {
      return this.config.loaderOption.json;
    });
    this.addLoader(/\.(png|jpe?g|gif|svg)(\?.*)?$/, 'url-loader', () => {
      return merge({
        query: {
          limit: 1024,
          name: this.config.imageName
        }
      }, this.config.loaderOption.imageUrl)
    });
    this.addLoader(/\.(woff2?|eot|ttf|otf)(\?.*)?$/, 'url-loader', () => {
      return merge({
        query: {
          limit: 1024,
          name: this.config.frontName
        }
      }, this.config.loaderOption.fontUrl)
    });
  }

  initPlugin() {
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

  initCreate() {
    if (this.config.create) {
      this.config.create.bind(this)();
    }
  }

  createFileOption() {
    this.createFileName();
    this.createImageName();
    this.createCssName();
    this.createFrontName();
  }

  createOption() {
    this.setOption({
      output: {
        path: this.buildPath,
        publicPath: this.publicPath,
        filename: this.config.filename,
        chunkFilename: this.config.chunkFilename
      }
    });
  }

  create() {
    this.validate();
    this.createFileOption();
    this.createOption();
    const webpackConfig = merge(this.options, {
      module: {
        rules: this.createWebpackLoader()
      },
      plugins: this.createWebpackPlugin()
    });
    this.logger.debug();
    return webpackConfig;
  }

  initEnv(config) {
    // local/dev, test, prod
    this.env = config.env;
    if (this.env === 'test') {
      this.dev = false;
      this.test = true;
      this.prod = false;
      this.config = merge(this.config, Config.testConfig);
    } else if (this.env === 'prod') {
      this.dev = false;
      this.test = false;
      this.prod = true;
      this.config = merge(this.config, Config.defaultConfig);
    } else {
      this.dev = true;
      this.test = false;
      this.prod = false;
      this.config = merge(this.config, Config.devConfig);
      process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    }
  }

  initConfig(config) {
    this.config = merge(this.config, config);
  }

  initialize() {
    const config = this.config;
    this.setHot(config.hot);
    this.setAlias(config.alias);
    this.setDefine(config.defines);
    this.setBuildPath(config.buildPath);
    this.setPublicPath(config.publicPath);
    this.setHashLength(config.hashLength);
    this.setFileNameHash(config.hash);
    this.setImageHash(config.hash);
    this.setFontHash(config.hash);
    this.setCssHash(config.hash);
    this.setMiniCss(config.miniCss);
    this.setMiniImage(config.miniImage);
    this.setMiniJs(config.miniJs);
    this.setAutoprefixer(config.autoprefixer);
    this.setCDN(config.cdn.url, config.cdn.dynamicDir);
    if (this.dev) {
      this.setDevMode(config.port, config.proxy);
    }
  }

  setHot(hot) {
    this.config.hot = hot;
  }

  setEnv(env, config) {
    this.initEnv({ env });
    this.initConfig(config);
    this.initialize();
  }

  setConfig(config) {
    this.config = merge(this.config, config);
  }

  setEntry(entry) {
    this.config.entry = entry;
  }

  setPrefix(prefix) {
    this.config.prefix = prefix;
  }

  setExtensions(extendsion) {
    this.options = merge(this.options, {
      resolve: {
        extensions: Array.isArray(extendsion) ? extendsion : [extendsion]
      }
    });
  }

  setExternals(externals) {
    this.options = merge(this.options, { externals });
  }

  setAlias(name = {}, value, useBaseDir = true) {
    if (Utils.isObject(name)) {
      Object.keys(name).forEach(key => {
        this.setAlias(key, name[key]);
      });
    } else {
      const alias = {};
      alias[name] = useBaseDir ? Utils.normalizePath(value, this.config.baseDir) : value;
      this.options = merge(this.options, {
        resolve: { alias }
      });
    }
  }

  setDefine(defines) {
    this.config.defines = merge(this.config.defines, defines);
  }

  setMiniImage(miniImage) {
    this.addPlugin(ImageminPlugin, () => {
      const defaultOption = {
        pngquant: {
          quality: '90'
        }
      };
      return Utils.isObject(miniImage) ? merge(defaultOption, miniImage) : defaultOption;
    }, !!miniImage);
  }

  setMiniJs(miniJs) {
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

  setMiniCss(miniCss) {
    this.setLoaderOption(Utils.isObject(miniCss) ? miniCss : { minimize: !!miniCss });
  }

  setLoaderOption(option) {
    this.config.loaderOption = merge(this.config.loaderOption, option);
  }

  setPluginOption(option) {
    this.config.pluginOption = merge(this.config.pluginOption, option);
  }

  setAutoprefixer(prefixer, replace = true) {
    const postcss = this.config.loaderOption && this.config.loaderOption.options && this.config.loaderOption.options.postcss;
    if (prefixer === false && postcss) {
      this.config.loaderOption.options.postcss = postcss.filter(item => {
        if (Utils.isObject(item) && item.postcssPlugin === 'autoprefixer') {
          return false;
        }
        return true;
      });
    } else {
      const prefixerOption = prefixer && replace ? prefixer : merge({ browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8'] }, prefixer);
      this.setLoaderOption({
        options: {
          postcss: [
            require('autoprefixer')(prefixerOption)
          ]
        }
      });
    }
  }

  setHashLength(len = 8) {
    this.config.hashLength = len;
  }

  setFileNameHash(isHash) {
    this.config.fileHash = isHash;
  }

  setImageHash(isHash) {
    this.config.imageHash = isHash;
  }

  setFontHash(isHash) {
    this.config.fontHash = isHash;
  }

  setCssHash(isHash) {
    this.config.cssHash = isHash;
  }

  setStyleLoaderName(name) {
    this.config.styleLoaderName = name;
  }

  setStyleLoaderOption(option) {
    this.config.styleLoaderOption = merge(this.config.styleLoaderOption, option);
  }

  setCommonsChunk(commonsChunk) {
    this.config.commonsChunk = Array.isArray(commonsChunk) ? commonsChunk : (commonsChunk ? [commonsChunk] : /* istanbul ignore next */ null);
  }

  addCommonsChunk(ex) {
    if (this.config.commonsChunk) {
      this.addPlugin(this.webpack.optimize.CommonsChunkPlugin, () => {
        const packKeys = Object.keys(this.packs);
        const chunks = Object.keys(this.options.entry).filter(entry => {
          return !packKeys.includes(entry);
        });
        const defaultOption = { names: this.config.commonsChunk, chunks };
        return Utils.isObject(ex) ? merge(defaultOption, ex) : defaultOption;
      }, ex);
    }
  }

  addBuildConfig() {
    if (this.config.buildConfig) {
      const host = Utils.getHost(this.config.port);
      const filepath = path.join(this.config.baseDir, 'config/buildConfig.json');
      const buildConfig = {
        buildPath: this.buildPath.replace(this.config.baseDir, '').replace(/^\//, ''),
        publicPath: this.config.proxy ? this.publicPath.replace(host, '') : this.publicPath,
        commonsChunk: this.config.commonsChunk
      };
      Utils.saveBuildConfig(filepath, buildConfig);
    }
  }

  addManifest() {
    this.addPlugin(ManifestPlugin, () => {
      const manifest = this.config.manifest && this.config.manifest.name || 'config/manifest.json';
      const fileName = path.relative(this.buildPath, manifest);
      return { fileName };
    }, this.config.manifest);
  }

  addHot() {
    this.addPlugin(this.webpack.HotModuleReplacementPlugin, null, this.config.hot);
  }

  addEntry(name, value) {
    const entry = {};
    entry[name] = value;
    this.setOption({ entry });
  }

  addProvide(defines) {
    this.addPlugin(webpack.ProvidePlugin, defines, true, false);
  }

  createEntry() {
    const entry = Utils.createEntry(this.config, this.type);
    this.setOption({ entry });
  }

  addLoader(test, loader, option, ex, action = 'append') {
    option = Utils.isFunction(option) ? { fn: option } : option;
    if (Utils.isObject(test) && test.hasOwnProperty('test')) {
      loader = merge(test, option, ex);
    } else {
      loader = Utils.isString(loader) && /-loader$/.test(loader) ? require.resolve(loader) : loader;
      loader = merge({ test, loader }, option, ex);
    }
    if (action === 'append' || !action) {
      this.loaders = this.loaders.concat(loader);
    } else {
      const loaderIndex = this.findLoaderIndex(loader);
      if (loaderIndex > -1) {
        if (action === 'replace') {
          this.loaders[loaderIndex] = loader;
        } else if (action === 'merge') {
          const loaderInfo = this.loaders[loaderIndex];
          if (loader.test && loaderInfo.test && loader.loader && loaderInfo.loader && loader.test.toString() === loaderInfo.test.toString()) {
            const mergeLoader = merge({}, loaderInfo);
            delete mergeLoader.loader;
            if (!mergeLoader.use) {
              mergeLoader.use = [{ loader: loaderInfo.loader, options: loaderInfo.options || loaderInfo.query }];
            }
            if (loader.use) {
              mergeLoader.use = mergeLoader.use.concat(loader.use);
            } else {
              mergeLoader.use.push({ loader: loader.loader, options: loader.options || loader.query });
            }
            this.loaders[loaderIndex] = mergeLoader;

          } else {
            this.loaders[loaderIndex] = merge(loaderInfo, loader);
          }
        } else {
          this.loaders = this.loaders.concat(loader);
        }
      }
    }
  }

  findLoaderIndex(loader, match = 'all') {
    return this.loaders.findIndex(item => {
      if (Utils.isString(loader)) {
        return item.loader && require.resolve(loader) === require.resolve(item.loader);
      }

      if ((match === 'all' || !match) && loader.test && item.test && loader.loader && item.loader) {
        if (loader.test.toString() === item.test.toString() && require.resolve(loader.loader) === require.resolve(item.loader)) {
          return true;
        }
      }

      if ((match === 'test' || !match) && loader.test && item.test && loader.test.toString() === item.test.toString()) {
        return true;
      }

      if ((match === 'loader' || !match) && loader.loader && item.loader && require.resolve(loader.loader) === require.resolve(item.loader)) {
        return true;
      }

      return false;
    });
  }

  updateLoader(loader, match) {
    const loaderIndex = this.findLoaderIndex(loader, match);
    if (loaderIndex > -1) {
      this.loaders[loaderIndex] = merge(this.loaders[loaderIndex], loader);
      return this.loaders[loaderIndex];
    }
    return null;
  }

  deleteLoader(loader, match) {
    const loaderIndex = this.findLoaderIndex(loader, match);
    if (loaderIndex > -1) {
      return this.loaders.splice(loaderIndex, 1);
    }
    return null;
  }

  addPlugin(clazz, args, enable, replace = true) {
    const plugin = { clazz, args, enable };
    const pluginIndex = this.findPluginIndex(clazz);
    if (replace && pluginIndex > -1) {
      this.plugins[pluginIndex] = plugin;
    } else {
      this.plugins.push(plugin);
    }
  }

  findPluginIndex(plugin) {
    const pluginName = Utils.isString(plugin) ? plugin : Utils.isObject(plugin) ? plugin.constructor && plugin.constructor.name : plugin.name;
    return this.plugins.findIndex(item => {
      const configPlugin = item.clazz || /* istanbul ignore next */ item;
      const itemPluginName = Utils.isObject(configPlugin) ? configPlugin.constructor && configPlugin.constructor.name : configPlugin.name;
      return itemPluginName === pluginName;
    });
  }

  updatePlugin(plugin, args) {
    const pluginIndex = this.findPluginIndex(plugin);
    if (pluginIndex > -1) {
      return this.plugins[pluginIndex] = { clazz: plugin, args };
    }
    return null;
  }

  deletePlugin(plugin) {
    const pluginIndex = this.findPluginIndex(plugin);
    if (pluginIndex > -1) {
      return this.plugins.splice(pluginIndex, 1);
    }
    return null;
  }

  addPack(name = {}, value, useCommonsChunk = false) {
    if (Utils.isObject(name)) {
      Object.keys(name).forEach(packName => {
        this.addPack(packName, name[packName])
      });
    } else {
      const files = Array.isArray(value) ? value : [value];
      const normalizeFiles = files.map(file => {
        return Utils.normalizePath(file, this.config.baseDir);
      });
      this.addEntry(name, normalizeFiles);
      /* istanbul ignore if */
      if (!useCommonsChunk) {
        this.packs[name] = normalizeFiles;
      }
    }
  }

  setOption(option) {
    this.options = merge(this.options, option);
  }

  setBuildPath(buildPath) {
    this.buildPath = path.isAbsolute(buildPath) ? buildPath : path.join(this.config.baseDir, buildPath);
  }

  setPublicPath(publicPath, isOverride = true) {
    if (!this.publicPath) {
      this.publicPath = '';
    }
    if (isOverride) {
      this.publicPath = publicPath;
    } else {
      this.publicPath = Utils.joinPath(this.publicPath, publicPath);
    }
    this.publicPath = `${this.publicPath.replace(/\/$/, '')}/`;
  }

  setCDN(cdnUrl, cdnDynamicDir) {
    if (cdnUrl) {
      const publicPath = cdnDynamicDir ? Utils.joinPath(cdnUrl, cdnDynamicDir) : cdnUrl;
      this.setPublicPath(publicPath);
    }
  }

  setProxy(proxy) {
    this.config.proxy = proxy;
  }

  setDevMode(port, proxy = false) {
    this.config.port = port || 9000;
    this.config.proxy = proxy;
    const host = Utils.getHost(this.config.port);
    this.setPublicPath(Utils.joinPath(host, this.config.publicPath));
    const testFile = path.join(this.config.baseDir, '.webpack.js');
    /* istanbul ignore if */
    if (fs.existsSync(testFile)) {
      const test = require(testFile);
      if (test.enable) {
        this.config = merge(this.config, test.config);
      }
    }
  }

  setDevTool(devtool, force) {
    /* istanbul ignore next */
    if (!this.config.prod || force) {
      this.options = merge(this.options, { devtool });
    }
  }

  createWebpackLoader() {
    const webpackLoaders = [];
    const styleConfig = this.getStyleConfig();
    Loader.styleLoaders(styleConfig).forEach(loader => {
      this.loaders.push(loader);
    });
    this.loaders.forEach(loader => {
      if (loader.fn && Utils.isFunction(loader.fn)) {
        const tempLoader = Object.assign({}, loader);
        const loaderConfig = tempLoader.fn();
        delete tempLoader.fn;
        webpackLoaders.push(merge(tempLoader, loaderConfig));
      } else {
        webpackLoaders.push(loader);
      }
    });
    this.logger.loader(webpackLoaders);
    return webpackLoaders;
  }

  createWebpackPlugin() {
    const webpackPlugins = [];
    this.plugins.forEach(plugin => {
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
    this.logger.plugin(webpackPlugins);
    return webpackPlugins;
  }

  validate() {
    assert(this.buildPath, 'webpack output path not set, please call setBuildPath method set');
    assert(this.publicPath, 'webpack output publicPath not set, please call setPublicPath method set');
    /* istanbul ignore next */
    assert(this.config.entry || this.config.html || this.options.entry, 'webpack entry is empty, please call setEntry or setHtml');
  }

  createFileName() {
    if (this.config.fileHash) {
      this.config.filename = Utils.assetsPath(this.config.prefix, `js/[name].[chunkhash:${this.config.hashLength}].js`);
      this.config.chunkFilename = Utils.assetsPath(this.config.prefix, `js/chunk/[name].[chunkhash:${this.config.hashLength}].js`);
    } else {
      this.config.filename = Utils.assetsPath(this.config.prefix, 'js/[name].js');
      this.config.chunkFilename = Utils.assetsPath(this.config.prefix, 'js/chunk/[name].js');
    }
  }

  createImageName() {
    if (this.config.imageHash) {
      this.config.imageName = Utils.assetsPath(this.config.prefix, `img/[name].[hash:${this.config.hashLength}].[ext]`);
    } else {
      this.config.imageName = Utils.assetsPath(this.config.prefix, 'img/[name].[ext]');
    }
  }

  createCssName() {
    if (this.config.cssHash) {
      this.config.cssName = Utils.assetsPath(this.config.prefix, `css/[name].[contenthash:${this.config.hashLength}].css`);
    } else {
      this.config.cssName = Utils.assetsPath(this.config.prefix, 'css/[name].css');
    }
  }

  createFrontName() {
    if (this.config.fontHash) {
      this.config.frontName = Utils.assetsPath(this.config.prefix, `font/[name].[hash:${this.config.hashLength}].[ext]`);
    } else {
      this.config.frontName = Utils.assetsPath(this.config.prefix, 'font/[name].[ext]');
    }
  }

  /* istanbul ignore next */
  getStyleLoaderOption() {
    const styleConfig = this.getStyleConfig();
    return Loader.getStyleLoaderOption(styleConfig);
  }

  getStyleConfig() {
    return {
      extractCss: this.config.extractCss,
      styleLoaderName: this.config.styleLoaderName,
      styleLoaderOption: merge({
        sass: {
          options: {
            indentedSyntax: true
          }
        }
      }, this.config.styleLoaderOption)
    };
  }
}

module.exports = WebpackBaseBuilder;