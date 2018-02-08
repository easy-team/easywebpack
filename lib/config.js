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
    this._config = config;
    this.webpack = webpack;
    this.merge = merge;
    this.utils = utils;
    this.packs = {};
    this.startCreateQueue = [];
    this.beforeCreateQueue = [];
    this.config = {};
    this.baseDir = config.baseDir || process.cwd();
    this.logger = new Logger(config.logger, this);
    this.adapter = new Adapter(this);
    this.webpackNodeList = [
      'context', 'target', 'node', 'output', 'externals', 'resolve', 'watch', 'watchOptions', 'amd',
      'resolveLoader', 'devServer', 'performance', 'module', 'cache', 'profile', 'stats', 'cache'
    ];
    this.initConfig(config);
  }

  initConfig(config) {
    this.outerConfig = this.initConfigInfo(config);
    this.config = { outerConfig: this.outerConfig };
    this.outerWebpackConfig = this.initConfigWebpackConfig(this.outerConfig);
    this.configLoaders = this.utils.cloneDeep(config.loaders);
    this.configPlugins = this.utils.cloneDeep(config.plugins);
    this.webpackConfig = this.utils.cloneDeep(require('../config/webpack'));
    this.loaders = this.utils.cloneDeep(require('../config/loader'));
    this.plugins = this.utils.cloneDeep(require('../config/plugin'));
    const pkgFile = path.join(this.baseDir, 'package.json');
    const devDependencies = fs.existsSync(pkgFile) ? require(pkgFile).devDependencies : {};
    const fullDependencies = require('../package.json').fullDependencies;
    this.dependencies = this.utils.getDeps(devDependencies, fullDependencies);
  }

  initConfigInfo(config) {
    const configInfo = {};
    Object.keys(config).forEach(key => {
      configInfo[key] = config[key];
    });
    return configInfo;
  }

  initConfigWebpackConfig(config) {
    // compatible easywebpack below 3.5.0 version
    const optionWebpackConfig = config.options;
    const configWebpackConfig = this.analysisWebpackConfig(this.outerConfig);
    return this.mergeWebpackConfig(optionWebpackConfig, configWebpackConfig);
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
      this.config.imageName = utils.assetsPath(prefix, `img/[name].[hash:${this.config.hashLength}].[ext]`);
    } else {
      this.config.imageName = utils.assetsPath(prefix, 'img/[name].[ext]');
    }
  }

  createCssName() {
    const prefix = this.config.prefix;
    if (this.config.cssHash) {
      this.config.cssName = utils.assetsPath(prefix, `css/[name].[contenthash:${this.config.hashLength}].css`);
    } else {
      this.config.cssName = utils.assetsPath(prefix, 'css/[name].css');
    }
  }

  createFrontName() {
    const prefix = this.config.prefix;
    if (this.config.fontHash) {
      this.config.frontName = utils.assetsPath(prefix, `font/[name].[hash:${this.config.hashLength}].[ext]`);
    } else {
      this.config.frontName = utils.assetsPath(prefix, 'font/[name].[ext]');
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
    this.setBuildPath(buildPath);
    this.webpackConfig.output.path = this.config.buildPath;
  }

  setOutputPublicPath(publicPath) {
    this.setPublicPath(publicPath, true);
    this.webpackConfig.output.publicPath = this.config.publicPath;
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
    hot = this.utils.has(this.outerConfig.hot) ? this.outerConfig.hot : hot;
    if (utils.has(hot)) {
      this.mergePlugin({ hot });
    }
  }

  setManifest(manifest) {
    manifest = this.safeMerge(manifest, this.outerConfig.manifest);
    if (utils.has(manifest)) {
      this.mergePlugin({ manifest });
    }
  }
  setDefine(key, value) {
    if (utils.has(key)) {
      let define = {};
      if (value !== undefined) {
        const args = {};
        args[key] = value;
        define = { args };
      }
      define = this.safeMerge(define, this.outerConfig.define);
      this.mergePlugin({ define });
    }
  }
  setProvide(key, value) {
    if (utils.has(key)) {
      let provide = {};
      if (value !== undefined) {
        const args = {};
        args[key] = value;
        provide = { args };
      }
      provide = this.safeMerge(provide, this.outerConfig.provide);
      this.mergePlugin({ provide });
    }
  }


  setMiniImage(imagemini) {
    imagemini = this.safeMerge(imagemini, this.outerConfig.imagemini);
    if (utils.has(imagemini)) {
      this.mergePlugin({ imagemini });
    }
  }

  setMiniJs(uglifyJs) {
    uglifyJs = this.safeMerge(uglifyJs, this.outerConfig.uglifyJs);
    if (utils.has(uglifyJs)) {
      this.mergePlugin({ uglifyJs });
    }
  }

  setMiniCss(miniCss) {
    miniCss = this.safeMerge(miniCss, this.outerConfig.miniCss);
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

  setConfigValueByKey(key, value, option = {}) {
    const newValue = this.utils.has(this.outerConfig[key]) ? this.outerConfig[key] : value;
    if (this.utils.has(newValue)) {
      this.config[key] = newValue;
    }
  }

  setEgg(egg) {
    this.setConfigValueByKey('egg', egg);
  }

  setCssExtract(isCssExtract) {
    this.setConfigValueByKey('cssExtract', isCssExtract);
  }

  setProxy(proxy) {
    this.setConfigValueByKey('proxy', proxy);
  }

  setPort(port) {
    this.setConfigValueByKey('port', port || 9000);
  }

  setPrefix(prefix) {
    this.setConfigValueByKey('prefix', prefix);
  }

  setHashLength(len = 8) {
    this.setConfigValueByKey('hashLength', len);
  }

  setFileNameHash(isHash) {
    this.setConfigValueByKey('fileHash', isHash);
  }

  setImageHash(isHash) {
    this.setConfigValueByKey('imageHash', isHash);
  }

  setFontHash(isHash) {
    this.setConfigValueByKey('fontHash', isHash);
  }

  setCssHash(isHash) {
    this.setConfigValueByKey('cssHash', isHash);
  }

  setEntry(entry) {
    this.setConfigValueByKey('entry', entry);
  }

  setPack(name = {}, value, useCommonsChunk = false) {
    if (this.utils.has(name)) {
      this.addPack(name, value, useCommonsChunk);
    }
  }

  setBuildPath(buildPath, isOverride = false) {
    buildPath = !isOverride && this.outerConfig.buildPath ? this.outerConfig.buildPath : buildPath;
    if (this.utils.has(buildPath)) {
      this.config.buildPath = this.utils.normalizeBuildPath(buildPath, this.baseDir);
    }
  }

  setPublicPath(publicPath, isOverride = true) {
    publicPath = this.outerConfig.publicPath ? this.outerConfig.publicPath : publicPath;
    if (this.utils.has(publicPath)) {
      if (!this.config.publicPath) {
        this.config.publicPath = '';
      }
      if (isOverride) {
        this.config.publicPath = publicPath;
      } else {
        this.config.publicPath = this.utils.joinPath(this.config.publicPath, publicPath);
      }
      this.config.publicPath = this.utils.normalizePublicPath(this.config.publicPath);
    }
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

  setCDN(url, dynamicDir) {
    this.cdnUrl = this.getPublicPathFromCDN(url, dynamicDir);
  }

  setHost() {
    if (this.config.host && this.config.port) {
      this.host = `${this.config.host}:${this.config.port}`;
    } else {
      this.host = this.host || this.utils.getHost(this.config.port);
    }
  }

  setHostPublicPath(publicPath) {
    this.setHost();
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

  static getDllConfig(dll) {
    return utils.getDllConfig(dll);
  }

  static getDllFilePath(name, env) {
    return utils.getDllFilePath(name, env);
  }
}

module.exports = Config;