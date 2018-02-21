'use strict';
const path = require('path');
const fs = require('fs');
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const merge = WebpackTool.merge;
const utils = require('../utils/utils');
const Logger = require('../utils/logger');
const Adapter = require('../utils/adapter');

class Config {
  constructor(config) {
    this.t1 = Date.now();
    this.baseDir = config.baseDir || process.cwd();
    this.configList = [config];
    this.webpack = webpack;
    this.merge = merge;
    this.utils = utils;
    this.packs = {};
    this.webpackInfo = {};
    this.startCreateQueue = [];
    this.beforeCreateQueue = [];
    this.webpackNodeList = [
      'context', 'target', 'node', 'output', 'externals', 'resolve', 'watch', 'watchOptions', 'amd',
      'resolveLoader', 'devServer', 'performance', 'module', 'cache', 'profile', 'stats', 'cache'
    ];
    this.logger = new Logger(config.logger, this);
    this.adapter = new Adapter(this);
    this.initialize(config);
    this.initEnv(config);
  }

  get config() {
    return this.configList.reduce((result, item) => {
      return merge(result, item);
    }, {});
  }

  get buildPath() {
    return utils.normalizeBuildPath(this.config.buildPath, this.baseDir);
  }

  get publicPath() {
    const config = this.config;
    const configPublicPath = config.publicPath.replace(/\/$/, '');
    const cdnUrl = this.getPublicPathFromCDN(config.cdn);
    if (cdnUrl) {
      const configCdnUrl = cdnUrl.replace(/\/$/, '');
      if (configCdnUrl.endsWith(configPublicPath)) {
        return this.utils.normalizePublicPath(cdnUrl);
      }
      const publicPath = this.utils.joinPath(configCdnUrl, configPublicPath);
      return this.utils.normalizePublicPath(publicPath);
    } else if (this.dev) {
      const publicPath = this.setHostPublicPath(configPublicPath);
      return this.utils.normalizePublicPath(publicPath);
    }
    return this.utils.normalizePublicPath(configPublicPath);
  }

  initialize(config) {
    this.webpackConfig = this.utils.cloneDeep(require('../config/webpack'));
    this.loaders = this.utils.cloneDeep(require('../config/loader'));
    this.plugins = this.utils.cloneDeep(require('../config/plugin'));
    const pkgFile = path.join(this.baseDir, 'package.json');
    const devDependencies = fs.existsSync(pkgFile) ? require(pkgFile).devDependencies : {};
    const fullDependencies = require('../package.json').fullDependencies;
    this.dependencies = this.utils.getDeps(devDependencies, fullDependencies);
    if (config.host) {
      this.host = config.host;
    } else {
      this.host = this.utils.getHost(config.port);
    }
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
  }

  mergeConfig(config) {
    this.configList.splice(-1, 0, config);
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

  isConfigPlugin(plugin) {
    return this.utils.isObject(plugin) && plugin.name;
  }

  safeMerge(value, newValue) {
    if (this.utils.isObject(value) || Array.isArray(value)) {
      return this.merge(value, newValue);
    } else if (this.utils.has(newValue)) {
      return newValue;
    }
    return value;
  }

  createFileName() {
    const prefix = this.config.prefix;
    if (this.config.fileHash) {
      this.setOutputFileName(utils.assetsPath(prefix, `js/[name].[chunkhash:${this.config.hashLength}].js`));
      this.setOutputFileChunkName(utils.assetsPath(prefix, `js/chunk/[name].[chunkhash:${this.config.hashLength}].js`))
    } else {
      this.setOutputFileName(utils.assetsPath(prefix, 'js/[name].js'));
      this.setOutputFileChunkName(utils.assetsPath(prefix, 'js/chunk/[name].js'));
    }
  }

  createImageName() {
    const prefix = this.config.prefix;
    if (this.config.imageHash) {
      this.webpackInfo.imageName = utils.assetsPath(prefix, `img/[name].[hash:${this.config.hashLength}].[ext]`);
    } else {
      this.webpackInfo.imageName = utils.assetsPath(prefix, 'img/[name].[ext]');
    }
  }

  createCssName() {
    const prefix = this.config.prefix;
    if (this.config.cssHash) {
      this.webpackInfo.cssName = utils.assetsPath(prefix, `css/[name].[contenthash:${this.config.hashLength}].css`);
    } else {
      this.webpackInfo.cssName = utils.assetsPath(prefix, 'css/[name].css');
    }
  }

  createFrontName() {
    const prefix = this.config.prefix;
    if (this.config.fontHash) {
      this.webpackInfo.frontName = utils.assetsPath(prefix, `font/[name].[hash:${this.config.hashLength}].[ext]`);
    } else {
      this.webpackInfo.frontName = utils.assetsPath(prefix, 'font/[name].[ext]');
    }
  }

  setWebpackConfig(option) {
    this.webpackConfig = this.merge(this.webpackConfig, option);
  }

  setDevTool(devtool, force) {
    /* istanbul ignore next */
    if (devtool) {
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
      this.mergePlugin({ hot });
    }
  }

  setDefine(key, value) {
    if (utils.has(key)) {
      const args = {};
      args[key] = value;
      const define = { args };
      this.mergePlugin({ define });
    }
  }
  setProvide(key, value) {
    if (utils.has(key)) {
      const args = {};
      args[key] = value;
      const provide = { args };
      this.mergePlugin({ provide });
    }
  }


  setMiniImage(imagemini) {
    if (utils.has(imagemini)) {
      this.mergePlugin({ imagemini });
    }
  }

  setMiniJs(uglifyJs) {
    if (utils.has(uglifyJs)) {
      this.mergePlugin({ uglifyJs });
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
    this.mergeConfig({ entry });
  }

  setPack(name = {}, value, useCommonsChunk = false) {
    if (this.utils.has(name)) {
      this.addPack(name, value, useCommonsChunk);
    }
  }

  setBuildPath(buildPath) {
    this.mergeConfig({ buildPath });
  }

  setPublicPath(publicPath) {
    this.mergeConfig({ publicPath });
  }

  getPublicPathFromCDN(url, dynamicDir) {
    if (this.utils.has(url)) {
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
    } else {
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
    this.styleLoader = { loader, options };
  }

  static getDllConfig(dll) {
    return utils.getDllConfig(dll);
  }

  static getDllFilePath(name, env) {
    return utils.getDllFilePath(name, env);
  }
}

module.exports = Config;