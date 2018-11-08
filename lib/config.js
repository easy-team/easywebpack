'use strict';
const path = require('path');
const fs = require('fs');
const tool = require('node-tool-utils');
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const merge = WebpackTool.merge;
const utils = require('../utils/utils');
const uniq = require('lodash.uniq');
const Logger = require('../utils/logger');
const Adapter = require('../utils/adapter');
const zero = require('./zero');
class Config {
  constructor(config) {
    this.t1 = Date.now();
    this.webpack = webpack;
    this.merge = merge({
      customizeArray(a, b, key) {
        return uniq([...a, ...b]);
      }
    });
    this.utils = utils;
    this.baseDir = config.baseDir || process.cwd();
    this.config = utils.cloneDeep(config);
    this.config.baseDir = this.config.baseDir || this.baseDir;
    this.configList = [this.config];
    this.packs = {};
    this.useHost = false;
    this.webpackInfo = {};
    this.startCreateQueue = [];
    this.beforeCreateQueue = [];
    this.webpackNodeList = [
      'context', 'mode', 'target', 'node', 'output', 'externals', 'resolve', 'watch', 'watchOptions', 'amd',
      'resolveLoader', 'devServer', 'performance', 'module', 'profile', 'stats', 'cache', 'optimization'
    ];
    this.webpackModuleRuleKeys = [
      'test', 'use', 'include', 'exclude', 'issuer', 'loader', 'oneOf', 'options', 'parser', 'resource',
      'resourceQuery', 'rules', 'sideEffects'];
    this.sourceMapLoaders = [
      'css-loader',
      'sass-loader',
      'less-loader',
      'stylus-loader'
    ];
    this.loaderKeyLabelMapping = {
      scss: 'sass',
      typescript: 'ts',
      urlimage: 'url',
      urlmedia: 'url',
      urlfont: 'url',
      nunjucks: 'nunjucks-html'
    };
    this.logger = new Logger(this.config.logger, this);
    this.adapter = new Adapter(this);
    this.initZero(this.config);
    this.initEntry(this.config);
    this.initialize(this.config);
    this.initEnv(this.config);
    this.initBabelrc();
  }

  // get config() {
  //   return this.configList.reduce((result, item) => {
  //     return merge(result, item);
  //   }, {});
  // }

  get egg() {
    if (this._isEgg) {
      return this._isEgg;
    }
    this._isEgg = this.utils.isEgg(this.config);
    return this._isEgg;
  }

  get typescript() {
    const configLoaders = this.config.loaders;
    if (this.utils.isObject(configLoaders)) {
      if (configLoaders.typescript) {
        return true;
      }
    } else if (Array.isArray(configLoaders)) {
      return configLoaders.some(loader => {
        return !!loader.typescript;
      });
    }
    return false;
  }

  get framework() {
    return this.config.framework;
  }

  get buildPath() {
    return utils.normalizeBuildPath(this.config.buildPath, this.baseDir);
  }

  get publicPath() {
    const config = this.config;
    const host = this.host;
    const publicPath = config.publicPath.replace(/\/$/, '');
    if (this.utils.isHttpOrHttps(publicPath)) {
      return this.utils.normalizePublicPath(publicPath);
    }
    if (this.useHost) {
      return this.utils.normalizePublicPath(this.utils.joinPath(host, publicPath));
    }
    return this.utils.normalizePublicPath(publicPath);
  }

  get host() {
    let host = '';
    const config = this.config;
    const configPublicPath = config.publicPath.replace(/\/$/, '');
    const cdnUrl = this.getPublicPathFromCDN(config.cdn).replace(/\/$/, '');
    if (cdnUrl) {
      if (cdnUrl.endsWith(configPublicPath)) {
        host = cdnUrl.replace(configPublicPath, '');
      } else {
        host = cdnUrl;
      }
      this.useHost = true;
    } else if (this.dev) {
      const port = this.port;
      if (config.host) {
        host = /:\d{1,5}/.test(config.host) ? config.host : `${config.host.replace(/\/$/, '')}:${port}`;
        this.useHost = true;
      } else {
        host = this.utils.getHost(port);
        this.useHost = !this.proxy;
      }
    }
    return host.replace(/\/$/, '');
  }

  get port() {
    if (process.env.EASY_ENV_DEV_PORT) {
      return process.env.EASY_ENV_DEV_PORT;
    }
    process.env.EASY_ENV_DEV_PORT = tool.getPort(this.config.port);
    return process.env.EASY_ENV_DEV_PORT;
  }

  get proxy() {
    const config = this.config;
    return this.dev && !config.host && this.utils.isTrue(config.proxy);
  }

  get prefix() {
    return this.config.prefix || '';
  }

  get nativeWebpackConfig() {
    return this.configList.reduce((result, item) => {
      return merge(result, this.analysisWebpackConfig(item));
    }, this.webpackConfig);
  }

  get modules() {
    return this.nativeWebpackConfig.resolveLoader.modules;
  }

  get hot() {
    const hotPlugin = this.getPluginByName('hot');
    return hotPlugin && this.isEnable(hotPlugin.enable);
  }

  get babelConfig() {
    if (this._babelConfig) {
      return this._babelConfig;
    }
    this._babelConfig = this.utils.readFile(this.babelrc) || {};
    return this._babelConfig;
  }

  initZero(config) {
    if (this.egg) {
      zero.initEggDefault(config);
    } else {
      zero.initDefault(config);
    }
  }

  initBabelrc() {
    const projectBabelrc = path.join(this.baseDir, '.babelrc');
    if (fs.existsSync(projectBabelrc)) {
      this.babelrc = projectBabelrc;
      this.projectBabelrc = projectBabelrc;
    } else {
      this.babelrc = path.resolve(__dirname, '../config/babelrc');
    }
    const filepath = path.resolve(this.baseDir, 'node_modules', '@babel/core');
    this.isBabel7 = fs.existsSync(filepath);
  }

  initialize(config) {
    this.webpackConfig = this.utils.cloneDeep(require('../config/webpack'));
    this.loaders = this.utils.cloneDeep(require('../config/loader'));
    this.plugins = this.utils.cloneDeep(require('../config/plugin'));
    const pkgFile = path.join(this.baseDir, 'package.json');
    const devDependencies = fs.existsSync(pkgFile) ? require(pkgFile).devDependencies : {};
    const fullDependencies = require('../package.json').fullDependencies;
    this.dependencies = this.utils.getDeps(devDependencies, fullDependencies);
  }

  initEnv(config = {}) {
    this.env = config.env || 'dev'; // local/dev, test, prod
    this.dev = false;
    this.test = false;
    this.prod = false;
    const defaultConfig = require('../config/config');
    this.mergeConfig(defaultConfig.config);
    if (this.env === 'prod') {
      this.prod = true;
      this.mergeConfig(defaultConfig.prodConfig);
    } else if (this.env === 'test') {
      this.test = true;
      this.mergeConfig(defaultConfig.testConfig);
    } else {
      this.dev = true;
      this.mergeConfig(defaultConfig.devConfig);
    }
    this.webpackConfig.mode = this.test || this.prod ? 'production' : 'development';
  }

  initEntry(config) {
    // 解析 entry template loader 配置
    const entry = this.config.entry;
    const entryLoaderConfig = config.loaders && config.loaders.entry;
    if (!this.utils.isObject(entry) || (this.utils.isObject(entry) && !entry.include)) {
      if (this.utils.isObject(entryLoaderConfig)) {
        this.entryLoader = config.loaders.entry;
      } else if (this.utils.isTrue(entryLoaderConfig)) {
        this.entryLoader = {};
      }
    }
  }

  mergeConfig(config, override = false) {
    if (override) {
      this.configList.push(config);
    } else {
      this.configList.splice(-1, 0, config);
    }
    this.config = this.configList.reduce((result, item) => {
      return merge(result, item);
    }, {});
  }

  // 解析原始webpackConfig
  analysisWebpackConfig(config = {}) {
    const webpackConfig = {};
    Object.keys(config).forEach(key => {
      if (this.webpackNodeList.includes(key)) {
        webpackConfig[key] = config[key];
      }
    });
    return webpackConfig;
  }

  mergeWebpackConfig(sourceWebpackConfig = {}, newWebpackConfig = {}) {
    const webpackConfig = {};
    const sourceKeys = Object.keys(sourceWebpackConfig);
    const newKeys = Object.keys(newWebpackConfig);
    if (newKeys.length === 0) {
      return sourceWebpackConfig;
    }
    sourceKeys.forEach(key => {
      const sourceValue = sourceWebpackConfig[key];
      const newValue = newWebpackConfig[key];
      if (utils.isString(sourceValue) || utils.isBoolean(sourceValue)) {
        if (utils.has(newValue)) {
          webpackConfig[key] = newValue;
        } else {
          webpackConfig[key] = sourceValue;
        }
      } else if (key === 'externals') {
        webpackConfig[key] = [];
        if (sourceValue) {
          webpackConfig[key] = webpackConfig[key].concat(sourceValue);
        }
        if (newValue) {
          webpackConfig[key] = webpackConfig[key].concat(newValue);
        }
      } else if (utils.isObject(sourceValue) || Array.isArray(sourceValue) || utils.isObject(newValue) || Array.isArray(newValue)) {
        webpackConfig[key] = this.merge(sourceValue, newValue);
      } else {
        webpackConfig[key] = sourceValue || newValue;
      }
      const index = newKeys.indexOf(key);
      if (index > -1) {
        newKeys.splice(index, 1);
      }
    });

    newKeys.forEach(key => {
      webpackConfig[key] = newWebpackConfig[key];
    });

    return webpackConfig;
  }


  isType(type) {
    return type === undefined || type === this.type || (Array.isArray(type) && type.includes(this.type));
  }

  isEnv(env) {
    return env === undefined || env === this.env || (Array.isArray(env) && env.includes(this.env));
  }

  isEnable(enable) {
    if (this.utils.isFunction(enable)) {
      return enable.apply(this);
    }
    return this.utils.isTrue(enable);
  }

  isUse(name, range = 'plugin') {
    if (this.utils.isBoolean(name)) {
      return name;
    }
    const configInfo = this.utils.isObject(name) ? name : (range === 'plugin' ? this.getPluginByName(name) : this.getLoaderByName(name));
    return configInfo && this.isType(configInfo.type) && this.isEnv(configInfo.env) && this.isEnable(configInfo.enable);
  }

  isWebpackLoader(loader) {
    return this.utils.isObject(loader) && loader.test && (loader.loader || loader.use);
  }

  isWebpackPlugin(plugin) {
    return this.utils.isObject(plugin) && plugin.constructor && plugin.constructor.prototype && plugin.constructor.prototype.apply;
  }

  isWebpackApplyPlugin(plugin) {
    return this.utils.isObject(plugin) && this.utils.isFunction(plugin.apply);
  }

  isConfigPlugin(plugin) {
    return this.utils.isObject(plugin) && plugin.name;
  }

  isRuleKey(key) {
    return this.webpackModuleRuleKeys.some(rulekey => {
      return rulekey === key;
    });
  }

  hasRuleKey(obj) {
    return Object.keys(obj).some(key => {
      return this.isRuleKey(key);
    });
  }

  getLoaderByName(name) {
    const defaultLoaders = this.utils.cloneDeep(this.loaders);
    return this.mergeLoader(this.config.loaders, defaultLoaders)[name];
  }

  getCssLoaderOptions() {
    const itemLoader = this.getLoaderByName('css');
    if (itemLoader && itemLoader.use) {
      const cssLoader = itemLoader.use.find(loader => {
        return this.utils.isObject(loader) && loader.loader === 'css-loader';
      });
      return cssLoader && cssLoader.options;
    }
    return null;
  }

  getConfigPlugin(label) {
    const plugins = this.config.plugins || {};
    if (Array.isArray(plugins)) {
      return plugins.find(plugin => {
        return plugin[label] || {};
      });
    }
    return plugins[label] || {};
  }

  getPluginByName(label) {
    const defaultPlugins = this.utils.cloneDeep(this.plugins);
    const plugins = this.mergePlugin(this.config.plugins, defaultPlugins);
    if (plugins[label]) {
      plugins[label].args = this.parsePluginArgs(plugins[label], label);
    }
    return plugins[label];
  }

  safeMerge(value, newValue) {
    if (this.utils.isObject(value) || Array.isArray(value)) {
      return this.merge(value, newValue);
    } else if (this.utils.has(newValue)) {
      return newValue;
    }
    return value;
  }

  createFileName(config) {
    if ((config.hash && this.utils.isTrue(config.fileHash)) || config.fileHash) {
      this.setOutputFileName(utils.assetsPath(this.prefix, `js/[name].[chunkhash:${config.hashLength}].js`));
      this.setOutputFileChunkName(utils.assetsPath(this.prefix, `js/chunk/[name].[chunkhash:${config.hashLength}].js`));
    } else {
      this.setOutputFileName(utils.assetsPath(this.prefix, 'js/[name].js'));
      this.setOutputFileChunkName(utils.assetsPath(this.prefix, 'js/chunk/[name].js'));
    }
  }

  createImageName(config) {
    if ((config.hash && this.utils.isTrue(config.imageHash)) || config.imageHash) {
      this.webpackInfo.imageName = utils.assetsPath(this.prefix, `img/[name].[hash:${config.hashLength}].[ext]`);
    } else {
      this.webpackInfo.imageName = utils.assetsPath(this.prefix, 'img/[name].[ext]');
    }
  }

  createCssName(config) {
    if ((config.hash && this.utils.isTrue(config.cssHash)) || config.cssHash) {
      this.webpackInfo.cssName = utils.assetsPath(this.prefix, `css/[name].[contenthash:${config.hashLength}].css`);
      this.webpackInfo.cssChunkName = utils.assetsPath(this.prefix, `css/[id].[contenthash:${config.hashLength}].css`);
    } else {
      this.webpackInfo.cssName = utils.assetsPath(this.prefix, 'css/[name].css');
      this.webpackInfo.cssChunkName = utils.assetsPath(this.prefix, 'css/[id].css');
    }
  }

  createMediaName(config) {
    if ((config.hash && this.utils.isTrue(config.mediaHash)) || config.mediaHash) {
      this.webpackInfo.mediaName = utils.assetsPath(this.prefix, `media/[name].[hash:${config.hashLength}].[ext]`);
    } else {
      this.webpackInfo.mediaName = utils.assetsPath(this.prefix, 'media/[name].[ext]');
    }
  }

  createFrontName(config) {
    if ((config.hash && this.utils.isTrue(config.fontHash)) || config.fontHash) {
      this.webpackInfo.frontName = utils.assetsPath(this.prefix, `font/[name].[hash:${config.hashLength}].[ext]`);
    } else {
      this.webpackInfo.frontName = utils.assetsPath(this.prefix, 'font/[name].[ext]');
    }
  }

  setWebpackConfig(option) {
    this.webpackConfig = this.merge(this.webpackConfig, option);
  }

  // devtool 只在 dev 模式开启，build 模式需要 通过 easy build 显示制定 --devtool
  setDevTool(devtool, force) {
    // cli mode force devtool, not use default config
    const cliDevtool = this.config.cliDevtool;
    /* istanbul ignore next */
    if (this.utils.isString(cliDevtool)) {
      this.webpackConfig.devtool = cliDevtool;
    } else if (cliDevtool === true) {
      this.webpackConfig.devtool = 'source-map';
    } else if (devtool && this.dev) { /* istanbul ignore next */
      this.webpackConfig.devtool = devtool;
    }
  }

  setTarget(target) {
    this.webpackConfig.target = target;
  }

  setLibrary(library) {
    this.webpackConfig.output.library = library;
  }

  setLibraryTarget(libraryTarget) {
    this.webpackConfig.output.libraryTarget = libraryTarget;
  }

  setNode(node) {
    this.webpackConfig.node = node;
  }

  setOutputPath(buildPath) {
    this.webpackConfig.output.path = buildPath;
  }

  setOutputPublicPath(publicPath) {
    this.webpackConfig.output.publicPath = publicPath;
  }

  setOutputFileName(value) {
    this.webpackConfig.output.filename = value;
  }

  setOutputFileChunkName(value) {
    this.webpackConfig.output.chunkFilename = value;
  }

  setResolveLoader(resolveLoader) {
    this.webpackConfig.resolveLoader = this.merge(this.webpackConfig.resolveLoader, resolveLoader);
  }

  setExternals(externals) {
    if (!this.webpackConfig.externals) {
      this.webpackConfig.externals = [];
    }
    if (Array.isArray(externals)) {
      this.webpackConfig.externals = this.webpackConfig.externals.concat(externals);
    } else {
      this.webpackConfig.externals.push(externals);
    }
  }

  setExtensions(extension, append = true) {
    if (extension) {
      const extensions = this.webpackConfig.resolve && this.webpackConfig.resolve.extensions || [];
      const newExtensions = Array.isArray(extension) ? extension : [extension];
      newExtensions.forEach(ext => {
        if (!extensions.includes(ext)) {
          if (append) {
            extensions.push(ext);
          } else {
            extensions.unshift(ext);
          }
        }
      });
      this.webpackConfig.resolve.extensions = extensions;
    }
  }

  setAlias(name = {}, value, useBaseDir = true) {
    if (this.utils.isObject(name)) {
      Object.keys(name).forEach(key => {
        this.setAlias(key, name[key]);
      });
    } else if (name) {
      const alias = {};
      alias[name] = useBaseDir ? this.utils.normalizePath(value, this.baseDir) : value;
      if (useBaseDir) {
        const absProjectFilePath = this.utils.normalizePath(value, this.baseDir);
        if (fs.existsSync(absProjectFilePath)) {
          alias[name] = absProjectFilePath;
        } else {
          const absNodeModuleFilePath = path.join(this.baseDir, 'node_modules', value);
          if (fs.existsSync(absNodeModuleFilePath)) {
            alias[name] = absNodeModuleFilePath;
          } else {
            alias[name] = value;
          }
        }
      }
      this.webpackConfig.resolve.alias = this.merge(this.webpackConfig.resolve.alias, alias);
    }
  }

  setHot(hot) {
    if (utils.has(hot)) {
      this.mergePlugin({
        hot
      });
    }
  }

  setDefine(key, value) {
    if (utils.has(key)) {
      const args = {};
      args[key] = value;
      const define = {
        args
      };
      this.mergePlugin({
        define
      });
    }
  }
  setProvide(key, value) {
    if (utils.has(key)) {
      const args = {};
      args[key] = value;
      const provide = {
        args
      };
      this.mergePlugin({
        provide
      });
    }
  }


  setMiniImage(imagemini) {
    if (utils.has(imagemini)) {
      this.mergePlugin({
        imagemini
      });
    }
  }

  setMiniJs(uglifyJs) {
    if (utils.has(uglifyJs)) {
      this.mergePlugin({
        uglifyJs
      });
    }
  }

  setMiniCss(miniCss) {
    if (utils.has(miniCss)) {
      this.loaders.options = this.merge(this.loaders.options, {
        css: {
          options: {
            minimize: this.utils.isTrue(miniCss)
          }
        }
      });
    }
  }

  setEntry(entry) {
    this.mergeConfig({
      entry
    });
  }

  setPack(name = {}, value, useCommonsChunk = false) {
    if (this.utils.has(name)) {
      this.addPack(name, value, useCommonsChunk);
    }
  }

  setBuildPath(buildPath, override) {
    this.mergeConfig({
      buildPath
    }, override);
  }

  setPublicPath(publicPath, override) {
    this.mergeConfig({
      publicPath
    }, override);
  }

  getPublicPathFromCDN(url, dynamicDir) {
    if (!this.dev && this.utils.has(url)) {
      let cdnUrl = url;
      let cdnDir = dynamicDir;
      if (this.utils.isObject(url)) {
        cdnDir = url.dynamicDir;
        cdnUrl = url.url;
      }
      if (cdnUrl) {
        return cdnDir ? this.utils.joinPath(cdnUrl, cdnDir) : cdnUrl;
      }
    }
    return '';
  }

  setHostPublicPath(publicPath) {
    if (this.utils.isHttpOrHttps(publicPath) || publicPath.includes(this.host)) {
      return publicPath;
    }
    return this.utils.joinPath(this.host, publicPath);
  }

  addPack(name = {}, value, useCommonsChunk = false) {
    if (this.utils.isObject(name)) {
      Object.keys(name).forEach(packName => {
        this.addPack(packName, name[packName]);
      });
    } else if (value) {
      const files = Array.isArray(value) ? value : [value];
      const normalizeFiles = files.map(file => {
        return this.utils.normalizePath(file, this.baseDir);
      });
      this.addEntry(name, normalizeFiles);
      /* istanbul ignore if */
      if (!useCommonsChunk) {
        this.packs[name] = normalizeFiles;
      }
    }
  }

  addEntry(name, value) {
    const entry = {};
    if (this.utils.isObject(name)) {
      Object.assign(entry, name);
    } else {
      entry[name] = value;
    }
    Object.keys(entry).forEach(key => {
      this.webpackConfig.entry[key] = entry[key];
    });
  }

  setStyleLoader(loader, options) {
    this.styleLoader = {
      loader,
      options
    };
  }

  setBabelrc(babelrc) {
    if (!this.projectBabelrc) {
      this.babelrc = babelrc;
    }
  }

  static getDllConfig(dll) {
    return utils.getDllConfig(dll);
  }

  static getDllFilePath(name, env) {
    return utils.getDllFilePath(name, env);
  }
}

module.exports = Config;