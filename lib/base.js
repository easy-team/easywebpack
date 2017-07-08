'use strict';
const path = require('path');
const assert = require('assert');
const webpack = require('webpack');
const merge = require('webpack-merge');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const StatsPlugin = require('stats-webpack-plugin');
const chalk = require('chalk');
const Utils = require('../utils/utils');
const Loader = require('../utils/loader');

class WebpackBaseBuilder {
  constructor(baseDir) {
    this.baseDir = baseDir || path.join(__dirname, '../../../');
    this.prod = process.env.NODE_ENV === 'production';
    this.webpack = webpack;
    this.merge = merge;
    this.options = {};
    this.loaders = [];
    this.plugins = [];
    this.packs = {};
    this.prefix = '';
    this.setExtensions(['.js']);
    this.setMiniCss(this.prod);
    this.setMiniImage(this.prod);
    this.setMiniJs(this.prod);
    this.setFileNameHash(this.prod);
    this.setImageHash(this.prod);
    this.setCssHash(this.prod);
    this.setCssExtract(this.prod);
    this.setHot(!this.prod);
    this.setManifest(false);
  }

  createBabelLoader(ex) {
    this.addLoader(/\.js$/, 'babel-loader', { exclude: /node_modules/ }, ex);
  }

  createJSONLoader(ex) {
    this.addLoader(/\.json$/, 'json-loader', ex);
  }

  createImageLoader(ex) {
    this.addLoader(/\.(png|jpe?g|gif|svg)(\?.*)?$/, 'url-loader', () => ({
      query: {
        limit: 1024,
        name: this.imageName
      }
    }), ex);
  }

  createHotEntry() {
    if (this.isHotUpdate) {
      const hotMiddleware = require.resolve('webpack-hot-middleware').split(path.sep);
      hotMiddleware.pop();
      const hotConfig = `${path.posix.join(hotMiddleware.join(path.sep))}/client?path=http://${Utils.getIp()}:${this.port + 1}/__webpack_hmr&noInfo=false&reload=false&quiet=false`;
      const packKeys = Object.keys(this.packs);
      Object.keys(this.options.entry).forEach(name => {
        if (!/\./.test(name) && !packKeys.includes(name) && (this.commonsChunk && !this.commonsChunk.includes(name))) {
          this.options.entry[name] = [hotConfig].concat(this.options.entry[name]);
        }
      });
    }
  }

  createDefinePlugin(defines) {
    this.addPlugin(webpack.DefinePlugin, defines, true, false);
  }

  createProvidePlugin(defines) {
    this.addPlugin(webpack.ProvidePlugin, defines, true, false);
  }

  createNoErrorPlugin(ex) {
    this.addPlugin(webpack.NoEmitOnErrorsPlugin, null, ex);
  }

  createProgressPlugin(ex) {
    this.addPlugin(ProgressBarPlugin, () => {
      const defaultOption = {
        width: 100,
        format: `webpack build [:bar] ${chalk.green.bold(':percent')} (:elapsed seconds)`,
        clear: false
      };
      return Utils.isObject(ex) ? merge(defaultOption, ex) : defaultOption;
    }, ex);
  }

  createMiniImagePlugin(miniImage) {
    this.addPlugin(ImageminPlugin, () => {
      const defaultOption = {
        pngquant: {
          quality: '90'
        }
      };
      return Utils.isObject(miniImage) ? merge(defaultOption, miniImage) : defaultOption;
    }, !!miniImage);
  }

  createMiniJsPlugin(minijs) {
    this.addPlugin(webpack.optimize.UglifyJsPlugin, () => {
      const defaultOption = {
        compress: {
          warnings: false,
          dead_code: true,
          drop_console: true,
          drop_debugger: true
        }
      };
      return Utils.isObject(minijs) ? merge(defaultOption, minijs) : defaultOption;
    }, !!minijs);
  }

  createMiniCssPlugin(miniCss) {
    this.addPlugin(webpack.LoaderOptionsPlugin, () => Utils.isObject(miniCss) ? miniCss : { minimize: !!miniCss }, !!miniCss);
  }

  createCommonsChunkPlugin(ex) {
    if (this.commonsChunk) {
      this.addPlugin(webpack.optimize.CommonsChunkPlugin, () => {
        const packKeys = Object.keys(this.packs);
        const chunks = Object.keys(this.options.entry).filter(entry => {
          return !packKeys.includes(entry);
        });
        const defaultOption = { names: this.commonsChunk, chunks };
        return Utils.isObject(ex) ? merge(defaultOption, ex) : defaultOption;
      }, ex);
    }
  }

  createExtractTextPlugin(ex) {
    this.addPlugin(ExtractTextPlugin, () => this.cssName, !!ex);
  }

  createHtmlPlugin(htmlConfig) {
    this.addPlugin(HtmlWebpackPlugin, merge({
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      }
    }, htmlConfig), true, false);
  }

  createEntry() {
    if (this.entryDir) {
      const entryDirs = Array.isArray(this.entryDir) ? this.entryDir : [this.entryDir];
      const normalizeEntryDirs = entryDirs.map(entryDir => Utils.normalizePath(entryDir, this.baseDir));
      const entry = Utils.getEntry(normalizeEntryDirs, this.entryExclude);
      this.setOption({ entry });
    }
  }

  createHtmlEntry() {
    if (this.htmlEntryDir) {
      assert(this.htmlConfig && this.htmlConfig.template, 'webpack html template not set, please call setHtmlEntry method set');
      const entryDirs = Array.isArray(this.htmlEntryDir) ? this.htmlEntryDir : [this.htmlEntryDir];
      const normalizeEntryDirs = entryDirs.map(entryDir => Utils.normalizePath(entryDir, this.baseDir));
      const entry = Utils.getEntry(normalizeEntryDirs, this.htmlEntryExclude);
      this.setOption({ entry });
      Object.keys(entry).forEach(entryName => {
        const chunks = this.commonsChunk ? [].concat(this.commonsChunk).concat(entryName) : [entryName];
        const htmlDir = this.htmlConfig.htmlDir || this.prefix;
        const filename = `${htmlDir}/${entryName}.html`;
        const config = merge({ chunks, filename }, this.htmlConfig);
        this.createHtmlPlugin(config);
      });
    }
  }

  createManifestPlugin() {
    this.addPlugin(ManifestPlugin, () => {
      const manifest = this.manifest && this.manifest.name || 'config/manifest.json';
      const fileName = path.relative(this.buildPath, manifest);
      return { fileName };
    }, this.manifest);
  }

  createHotModuleReplacementPlugin(ex) {
    this.addPlugin(webpack.HotModuleReplacementPlugin, null, ex);
  }

  createStatPlugin(ex) {
    this.addPlugin(StatsPlugin, () => {
      const params = ['stats.json'];
      const defaultOption = {
        chunkModules: true,
        chunks: true,
        assets: true,
        modules: true,
        children: true,
        chunksSort: true,
        assetsSort: true
      };
      return params.push(Utils.isObject(ex) ? merge(defaultOption, ex) : defaultOption);
    }, ex);
  }

  addLoader(test, loader, option, ex) {
    option = Utils.isFunction(option) ? { fn: option } : option;
    if (Utils.isObject(test) && test.hasOwnProperty('test')) {
      loader = merge(test, option, ex);
    } else {
      loader = Utils.isString(loader) && /-loader$/.test(loader) ? require.resolve(loader) : loader;
      loader = merge({ test, loader }, option, ex);
    }
    const loaderIndex = this.findLoaderIndex(loader);
    if (loaderIndex > -1) {
      this.loaders[loaderIndex] = loader;
    } else {
      this.loaders = this.loaders.concat(loader);
    }
  }

  findLoaderIndex(loader, type) {
    return this.loaders.findIndex(item => {
      if (Utils.isString(loader)) {
        return require.resolve(loader) === require.resolve(item.loader);
      } else if (type === 'all' && loader.test && loader.loader) {
        return item.test && loader.test.toString() === item.test.toString() && loader.loader === item.loader;
      } else if (type === 'test' && loader.test) {
        return item.test && loader.test.toString() === item.test.toString();
      } else if (loader.loader) {
        return require.resolve(loader.loader) === require.resolve(item.loader);
      }
      return false;
    });
  }

  updateLoader(loader) {
    const loaderIndex = this.findLoaderIndex(loader);
    if (loaderIndex > -1) {
      this.loaders[loaderIndex] = merge(this.loaders[loaderIndex], loader);
    }
  }

  deleteLoader(loader) {
    const loaderIndex = this.findLoaderIndex(loader);
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
    const pluginName = Utils.isObject(plugin) ? plugin.constructor && plugin.constructor.name : plugin.name;
    return this.plugins.findIndex(item => {
      const configPlugin = item.clazz || item;
      const itemPluginName = Utils.isObject(configPlugin) ? configPlugin.constructor && configPlugin.constructor.name : configPlugin.name;
      return itemPluginName === pluginName;
    });
  }

  updatePlugin(plugin, args) {
    const pluginIndex = this.findPluginIndex(plugin);
    if (pluginIndex > -1) {
      this.plugins[pluginIndex] = merge(this.plugins[pluginIndex], { clazz: plugin, args });
    }
  }

  deletePlugin(plugin) {
    const pluginIndex = this.findPluginIndex(plugin);
    if (pluginIndex > -1) {
      return this.plugins.splice(pluginIndex, 1);
    }
    return null;
  }

  setOption(option) {
    this.options = merge(this.options, option);
  }

  setBuildPath(buildPath) {
    this.buildPath = path.isAbsolute(buildPath) ? buildPath : path.join(this.baseDir, buildPath);
  }

  setPublicPath(publicPath, isOverride = true) {
    if (isOverride) {
      this.publicPath = publicPath;
    } else {
      this.publicPath = Utils.joinPath(this.publicPath, publicPath);
    }
    this.publicPath = `${this.publicPath.replace(/\/$/, '')}/`;
  }

  setCDN(cdnUrl, cdnDynamicDir) {
    const publicPath = cdnDynamicDir ? Utils.joinPath(cdnUrl, cdnDynamicDir) : cdnUrl;
    this.setPublicPath(publicPath);
  }

  setDevMode(port) {
    this.port = port || 9000;
    const host = Utils.getHost(this.port);
    this.publicPath = Utils.joinPath(host, this.publicPath);
  }

  setDevTool(devtool, force) {
    if (!this.prod || force) {
      this.options = merge(this.options, { devtool });
    }
  }

  setHot(isHotUpdate) {
    this.isHotUpdate = isHotUpdate;
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
    return webpackPlugins;
  }

  validate() {
    assert(this.buildPath, 'webpack output path not set, please call setBuildPath method set');
    assert(this.publicPath, 'webpack output publicPath not set, please call setPublicPath method set');
    assert(this.entryDir || this.htmlEntryDir || this.options.entry, 'webpack entry is empty, please call setEntry or setEntry or setHtmlEntry');
  }


  createOption() {
    this.setOption({
      output: {
        path: this.buildPath,
        publicPath: this.publicPath,
        filename: this.filename,
        chunkFilename: this.chunkFilename
      }
    });
  }

  initOption() {
    this.createEntry();
    this.createHtmlEntry();
    this.createHotEntry();
    this.createOption();
  }

  initLoader() {
    this.createBabelLoader();
    this.createJSONLoader();
    this.createImageLoader();
  }

  initPlugin() {
    this.createDefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development') });
    this.createNoErrorPlugin();
    this.createProgressPlugin();
    this.createManifestPlugin();
  }

  createInit() {
    this.validate();
    this.initOption();
    this.initLoader();
    this.initPlugin();
  }

  create() {
    this.createInit();
    return merge(this.options, {
      module: {
        rules: this.createWebpackLoader()
      },
      plugins: this.createWebpackPlugin()
    });
  }

  setEntry(entryDir, entryExclude) {
    this.entryDir = entryDir;
    this.entryExclude = entryExclude;
  }

  setHtmlEntry(htmlEntryDir, htmlConfig, htmlEntryExclude) {
    this.htmlEntryDir = htmlEntryDir;
    this.htmlEntryExclude = htmlEntryExclude;
    this.htmlConfig = htmlConfig;
  }

  addPack(name, value, useCommonsChunk = false) {
    this.addEntry(name, value);
    if (!useCommonsChunk) {
      this.packs[name] = value;
    }
  }

  addEntry(name, value) {
    const entry = {};
    entry[name] = value;
    this.options = merge(this.options, { entry });
  }

  setCommonsChunk(commonsChunk) {
    this.commonsChunk = Array.isArray(commonsChunk) ? commonsChunk : (commonsChunk ? [commonsChunk] : null);
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

  setAlias(name, value, useBaseDir) {
    const alias = {};
    alias[name] = useBaseDir ? Utils.normalizePath(value, this.baseDir) : value;
    this.options = merge(this.options, {
      resolve: { alias }
    });
  }


  setCssExtract(isExtract) {
    this.extractCss = isExtract;
    this.createExtractTextPlugin(isExtract);
  }

  setMiniCss(miniCss) {
    this.createMiniCssPlugin(miniCss);
  }

  setMiniImage(miniImage) {
    this.createMiniImagePlugin(miniImage);
  }

  setMiniJs(miniJs) {
    this.createMiniJsPlugin(miniJs);
  }

  setFileNameHash(isHash, len = 7) {
    this.isFileHash = isHash;
    this.fileHashLength = len;
  }

  setImageHash(isHash, len = 7) {
    this.isImageHash = isHash;
    this.imageHashLength = len;
  }

  setCssHash(isHash, len = 7) {
    this.isCssHash = isHash;
    this.cssHashLength = len;
  }

  createFileName() {
    if (this.isFileHash) {
      this.filename = Utils.assetsPath(this.prefix, `js/[name].[hash:${this.fileHashLength}].js`);
      this.chunkFilename = Utils.assetsPath(this.prefix, `js/[name].chunk.[chunkhash:${this.fileHashLength}].js`);
    } else {
      this.filename = Utils.assetsPath(this.prefix, 'js/[name].js');
      this.chunkFilename = Utils.assetsPath(this.prefix, 'js/[name].chunk.js');
    }
  }

  createImageName() {
    if (this.isImageHash) {
      this.imageName = Utils.assetsPath(this.prefix, `img/[name].[hash:${this.imageHashLength}].[ext]`);
    } else {
      this.imageName = Utils.assetsPath(this.prefix, 'img/[name].[ext]');
    }
  }

  createCssName() {
    if (this.isCssHash) {
      this.cssName = Utils.assetsPath(this.prefix, `css/[name].[contenthash:${this.cssHashLength}].css`);
    } else {
      this.cssName = Utils.assetsPath(this.prefix, 'css/[name].css');
    }
  }

  setPrefix(prefix) {
    this.prefix = prefix;
  }

  setStatToJson(statToJson) {
    this.statToJson = statToJson;
  }

  setManifest(manifest) {
    this.manifest = manifest;
  }

  setStyleLoaderName(name) {
    this.styleLoaderName = name;
  }

  setStyleLoaderOption(option) {
    this.styleLoaderOption = merge(this.styleLoaderOption, option);
  }

  getStyleLoaderOption() {
    const styleConfig = this.getStyleConfig();
    return Loader.getStyleLoaderOption(styleConfig);
  }

  getStyleConfig() {
    return {
      extractCss: this.extractCss,
      styleLoaderName: this.styleLoaderName,
      styleLoaderOption: this.styleLoaderOption
    };
  }

  ignoreCSS() {
    this.plugins.unshift({
      clazz: webpack.NormalModuleReplacementPlugin,
      args: [/\.css$/, require.resolve('node-noop')]
    }, {
      clazz: webpack.IgnorePlugin,
      args: /\.(css|less|scss|sass)$/
    });
  }
}

module.exports = WebpackBaseBuilder;
