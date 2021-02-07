'use strict';
const path = require('path');
const fs = require('fs');
const uniq = require('lodash.uniq');
const tool = require('node-tool-utils');
const { webpack, merge } = require('webpack-tool');
const WebpackOptimize = require('./optimize');
const WebpackLogger = require('../../utils/logger');
const utils = require('../../utils/utils');
const zero = require('../zero');
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
      'resolveLoader', 'devServer', 'performance', 'module.noParse', 'profile', 'stats', 'cache'
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
    // upgrade config
    this.refactorLoaderMapping = {
      typescript: 'ts'
    };
    this.loaderKeyLabelMapping = {
      scss: 'sass',
      typescript: 'ts',
      urlimage: 'url',
      urlmedia: 'url',
      urlfont: 'url',
      nunjucks: 'nunjucks-html'
    };
    this.logger = new WebpackLogger(this.config.logger, this);
    this.webpackOptimize = new WebpackOptimize(this);
    this.initZero(this.config);
    this.initEntry(this.config);
    this.initialize(this.config);
    this.initEnv(this.config);
    this.initBabelrc();
    this.initLoader();
  }
  

  get egg() {
    if (this._isEgg) {
      return this._isEgg;
    }
    this._isEgg = this.utils.isEgg(this.config);
    return this._isEgg;
  }

  get typescript() {
    if (this._typescript) {
      return this._typescript;
    }
    this._typescript = this.isUseLoader('ts');
    return this._typescript;
  }

  get renderMode() {
    if (this.config.template || this.config.target === 'web') {
      return 'csr';
    }
    return 'ssr';
  }

  get postcss() {
    return this.config.postcss;
  }

  get framework() {
    return this.config.framework;
  }

  get buildPath() {
    const buildPath = this.utils.getOutputPath(this.config);
    return utils.normalizeBuildPath(buildPath, this.baseDir);
  }

  get publicPath() {
    const host = this.host;
    const publicPath = this.utils.getOutputPublicPath(this.config);
    if (this.utils.isHttpOrHttps(publicPath)) {
      return this.utils.normalizePublicPath(publicPath);
    }
    if (this.useHost) {
      return this.utils.normalizePublicPath(this.utils.joinPath(host, publicPath));
    }
    return this.utils.normalizePublicPath(publicPath);
  }

  get devtool() {
    return this.webpackConfig.devtool;
  }

  get host() {
    let host = '';
    const config = this.config;
    const configPublicPath = this.utils.getOutputPublicPath(this.config);
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
    const EASY_ENV_DEV_PORT = `EASY_ENV_DEV_PORT_${this.pkgInfo.name}`;
    if (process.env[EASY_ENV_DEV_PORT]) {
      return process.env[EASY_ENV_DEV_PORT];
    }
    process.env[EASY_ENV_DEV_PORT] = tool.getPort(this.config.port);
    return process.env[EASY_ENV_DEV_PORT];
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

  // default babelrc config
  get babelConfig() {
    if (this._babelConfig) {
      return this._babelConfig;
    }
    if (this.utils.isObject(this.babelrc)) { // babel 7
      this._babelConfig = this.babelrc;
    } else if (this.utils.isString(this.babelrc)) { // babel 6
      this._babelConfig = this.utils.readFile(this.babelrc) || {};
    }
    return this._babelConfig;
  }

  // use different babel config for isomorphism application
  get babelEnv() {
    if (this.utils.isObject(this.projectBabelConfig)) {
      const target = this.webpackConfig.target || this.config.target || 'web';
      const env = this.projectBabelConfig.env;
      if (env && env[target]) {
        return target;
      }
    }
    return undefined;
  }

  get loaderOptions() {
    const loader = this.getConfigLoaderByName('options');
    if (this.utils.isObject(loader)) {
      return loader.options || loader;
    }
    return {};
  }

  initZero(config) {
    if (this.egg) {
      zero.initEggDefault(config);
    } else {
      zero.initDefault(config);
    }
  }

  initBabelrc() {
    const projectGlobalBabelrc = path.join(this.baseDir, 'babel.config.js');
    const projectBabelrc = path.join(this.baseDir, '.babelrc');
    const projectJsBabelrc = path.join(this.baseDir, '.babelrc.js');
    const filepath = path.resolve(this.baseDir, 'node_modules', '@babel/core');
    this.isBabel7 = fs.existsSync(filepath);
    if (fs.existsSync(projectGlobalBabelrc)) {
      this.projectBabelrc = projectGlobalBabelrc;
      this.projectBabelConfig = require(projectGlobalBabelrc);
    } else if (fs.existsSync(projectBabelrc)) {
      this.projectBabelrc = projectBabelrc;
      this.projectBabelConfig = this.utils.readFile(projectBabelrc);
    } else if (fs.existsSync(projectJsBabelrc)) {
      this.projectBabelrc = projectJsBabelrc;
      this.projectBabelConfig = require(projectJsBabelrc);
    }
  }

  initialize(config) {
    this.webpackConfig = this.utils.cloneDeep(require('./native'));
    this.loaders = this.utils.cloneDeep(require('../../config/loader'));
    this.plugins = this.utils.cloneDeep(require('../../config/plugin'));
    const pkgFile = path.join(this.baseDir, 'package.json');
    const defaultPkgInfo = { name: 'webpack-project', version: '1.0.0'};
    if (fs.existsSync(pkgFile)) {
      this.pkgInfo = Object.assign({}, defaultPkgInfo, require(pkgFile));
      const devDependencies = this.pkgInfo.devDependencies || {};
      const fullDependencies = require('../../package.json').fullDependencies || {};
      this.dependencies = this.utils.getDeps(devDependencies, fullDependencies);
    } else {
      this.pkgInfo = defaultPkgInfo;
      this.dependencies = {};
    }
  }

  initEnv(config = {}) {
    this.env = config.env || 'dev'; // local/dev, test, prod
    this.dev = false;
    this.test = false;
    this.prod = false;
    const { base, dev, test, prod } = require('../../config/config');
    this.mergeConfig(base);
    if (this.env === 'prod') {
      this.prod = true;
      this.mergeConfig(prod);
    } else if (this.env === 'test') {
      this.test = true;
      this.mergeConfig(test);
    } else {
      this.dev = true;
      this.mergeConfig(dev);
    }
    this.webpackConfig.mode = this.prod ? 'production' : 'development';
  }

  initEntry(config) {
    // 解析 entry template loader 配置
    const entry = this.config.entry;
    const entryLoaderConfig = config.loaders && config.loaders.entry;
    if (!this.utils.isObject(entry) || (this.utils.isObject(entry) && !entry.loader)) {
      if (this.utils.isObject(entryLoaderConfig)) {
        this.entryLoader = config.loaders.entry;
      } else if (this.utils.isTrue(entryLoaderConfig)) {
        this.entryLoader = {};
      }
    }
  }

  // merge base config, not include loaders and plugins
  mergeBaseConfig(config, override = false) {
    if (override) {
      this.configList.push(config);
    } else {
      this.configList.splice(-1, 0, config);
    }
    this.config = this.configList.reduce((result, item) => {
      return merge(result, item);
    }, {});
  }

  // merge all config , include base, loaders, plugins and so on
  mergeConfig(allConfig, override = false) {
    const { config = {}, loaders, plugins, module = {} } = allConfig;
    const baseConfig = Object.keys(allConfig).reduce((result, key) => {
      if (!['config', 'plugins', 'loaders', 'module'].includes(key)) {
        result[key] = allConfig[key];
      }
      return result;
    }, config);
    this.mergeBaseConfig(baseConfig, override);
    this.mergeLoader(loaders || {});
    this.mergeLoader(module.rules || []);
    this.mergePlugin(plugins || {});
  }

  // webpack native config
  analysisWebpackConfig(config = {}) {
    const webpackConfig = {};
    this.webpackNodeList.forEach(key => {
      if (config.hasOwnProperty(key)) {
        const value = this.utils.get(config, key);
        this.utils.set(webpackConfig, key, value);
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

  isUseLoader(name, isMatchType = true) {
    const configInfo = this.getMergeLoaderByName(name)[name];
    return this.isUseConfig(configInfo, isMatchType);
  }

  isUsePlugin(name, isMatchType = true) {
    const configInfo = this.getPluginByName(name);
    return this.isUseConfig(configInfo, isMatchType);
  }

  isUseConfig(configInfo, isMatchType = true ) {
    if (isMatchType) {
      return configInfo && this.isType(configInfo.type) && this.isEnv(configInfo.env) && this.isEnable(configInfo.enable);
    }
    return configInfo && this.isEnv(configInfo.env) && this.isEnable(configInfo.enable);
  }

  isUse(name, range = 'plugin') {
    if (this.utils.isBoolean(name)) {
      return name;
    }
    if (this.utils.isObject(name)) {
      return this.isUseConfig(name);
    }
    if (range === 'plugin') {
      return this.isUsePlugin(name);
    }
    return this.isUseLoader(name);
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

  safeMerge(value, newValue) {
    if (this.utils.isObject(value) || Array.isArray(value)) {
      return this.merge(value, newValue);
    } else if (this.utils.has(newValue)) {
      return newValue;
    }
    return value;
  }

  setWebpackConfig(option) {
    this.webpackConfig = this.merge(this.webpackConfig, option);
  }

  // devtool 只在 dev 模式开启，build 模式需要 通过 easy build 显示制定 --devtool
  setDevTool(devtool, force) {
    // cli mode force devtool, not use default config
    const cli = this.config.cli || {};
    /* istanbul ignore next */
    if (this.utils.isString(cli.devtool)) {
      this.webpackConfig.devtool = cli.devtool;
    } else if (cli.devtool === true) {
      this.webpackConfig.devtool = 'source-map';
    } else if (this.dev) { /* istanbul ignore next */
      if (devtool) {
        this.webpackConfig.devtool = devtool;
      } else {
        this.webpackConfig.devtool = 'eval';
      }
    } else {
      this.webpackConfig.devtool = false;
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

  setMiniCss(miniCss) {}

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
    if (!this.dev && url) {
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

  // 根据 BABEL_ENV 动态获取 BABEL 配置， 支持 node 和 web 配置
  setBabelENV(value) {
    // if (!this.isBabel7) {
    //   const target = this.webpackConfig.target || this.config.target || 'web';
    //   const key = value || target;
    //   try {
    //     const { env } = this.babelConfig || {};
    //     if (env && env[key]) {
    //       process.env.BABEL_ENV = key;
    //     }
    //   } catch (e) {
    //     /* istanbul ignore next */
    //   }
    // }
  }

  static getDllConfig(dll) {
    return utils.getDllConfig(dll);
  }

  static getDllFilePath(name, env) {
    return utils.getDllFilePath(name, env);
  }
}

Object.assign(Config.prototype, require('./output'));
Object.assign(Config.prototype, require('./loader'));
Object.assign(Config.prototype, require('./plugin'));

module.exports = Config;