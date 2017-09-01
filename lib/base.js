'use strict';
const path = require('path').posix;
const fs = require('fs');
const assert = require('assert');
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const merge = WebpackTool.merge;
const Logger = require('./logger');
const Utils = require('../utils/utils');
const Config = require('./config');

class WebpackBaseBuilder {
  constructor(config = {}) {
    this.webpack = webpack;
    this.merge = merge;
    this.options = {};
    this.packs = {};
    this.config = merge({}, config);
    this.configLoader = require('./loader');
    this.configPlugin = require('./plugin');
    this.logger = new Logger(config.logger, this);
    this.init();
  }

  init() {
    this.initEnv();
    this.initialize();
    this.setExtensions(['.js', '.jsx']);
    this.setResolveLoader({ modules: [path.resolve(__dirname, '../node_modules'), 'node_modules'] });
    this.logger.env();
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

  createWebpackLoader() {
    const loaders = [];
    Object.keys(this.configLoader).forEach(name => {
      const item = this.configLoader[name];
      if (item.enable || item.enable === undefined) {
        delete item.enable;
        if (Utils.isObject(item)) {
          loaders.push(item);
        } else if (Utils.isFunction(item)) {
          loaders.push(item());
        }
      }
    });
    return loaders;
  }

  createWebpackPlugin() {
    const plugins = this.config.plugin.plugins || [];
    Object.keys(this.configPlugin).forEach(name => {
      const defaultConfig = this.configPlugin[name];
      const customConfig = this.config.plugin[name] || {};
      const configInfo = merge(defaultConfig, customConfig);
      const isType = configInfo.type === undefined || configInfo.type === this.type || (Array.isArray(configInfo.type) && configInfo.type.includes(this.type));
      const isEnv = configInfo.env === undefined || configInfo.env === this.env || (Array.isArray(configInfo.env) && configInfo.env.includes(this.env));
      if (isType && isEnv) {
        if (Utils.isTrue(configInfo.enable) || (Utils.isFunction(configInfo.enable) && configInfo.enable.apply(this))) {
          if (Utils.isObject(configInfo.name)) { // plugin object initialize
            plugins.push(configInfo.name);
          } else if (Utils.isString(configInfo.name) || Utils.isFunction(configInfo.name)) {
            let Clazz = Utils.isString(configInfo.name) ? require(configInfo.name) : configInfo.name;
            if (configInfo.entry) {
              Clazz = Clazz[configInfo.entry];
            }
            if (defaultConfig.args || customConfig.args) {
              const defaultArgs = Utils.isFunction(defaultConfig.args) ? defaultConfig.args.apply(this) : defaultConfig.args;
              const customArgs = Utils.isFunction(customConfig.args) ? customConfig.args.apply(this) : customConfig.args;
              const args = Utils.isObject(defaultArgs) && Utils.isObject(customArgs) ? merge(defaultArgs, customArgs) : customArgs || defaultArgs;
              plugins.push(new (Function.prototype.bind.apply(Clazz, [null].concat(args)))());
            } else {
              plugins.push(new Clazz());
            }
          }
        }
      }
    });
    //console.log('-----------2',this.type, plugins);
    return plugins;
  }

  create() {
    console.log('---------', this.type, this.config.plugin);
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

  initEnv(config = {}) {
    this.env = this.config.env || config.env || 'dev'; // local/dev, test, prod
    if (this.env === 'test') {
      this.dev = false;
      this.test = true;
      this.prod = false;
      this.config = merge(Config.defaultConfig, Config.testConfig, this.config, config);
      process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    } else if (this.env === 'prod') {
      this.dev = false;
      this.test = false;
      this.prod = true;
      this.config = merge(Config.defaultConfig, this.config, config);
      process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    } else {
      this.dev = true;
      this.test = false;
      this.prod = false;
      this.config = merge(Config.defaultConfig, Config.devConfig, this.config, config);
      process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    }
  }

  initialize() {
    const config = this.config;
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

  setEnv(env, config) {
    this.initEnv(merge({ env }, config));
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

  setDefine(defines) {
    this.config.defines = merge(this.config.defines, defines);
  }

  setExtensions(extendsion) {
    this.options = merge(this.options, {
      resolve: {
        extensions: Array.isArray(extendsion) ? extendsion : [extendsion]
      }
    });
  }

  setResolveLoader(resolveLoader) {
    this.options = merge(this.options, { resolveLoader });
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

  setMiniImage(miniImage) {
    this.configPlugin.imagemini = merge(this.configPlugin.imagemini, { enable: Utils.isTrue(miniImage) });
  }

  setMiniJs(miniJs) {
    this.configPlugin.uglifyJs = merge(this.configPlugin.uglifyJs, { enable: Utils.isTrue(miniJs) });
  }

  setMiniCss(miniCss) {
    // console.log(miniCss);
  }

  setAutoprefixer(prefixer, replace = true) {
    //const postcss = this.config.loaderOption && this.config.loaderOption.options && this.config.loaderOption.options.postcss;
    //if (prefixer === false && postcss) {
    //  this.config.loaderOption.options.postcss = postcss.filter(item => {
    //    if (Utils.isObject(item) && item.postcssPlugin === 'autoprefixer') {
    //      return false;
    //    }
    //    return true;
    //  });
    //} else {
    //  const prefixerOption = prefixer && replace ? prefixer : merge({ browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8'] }, prefixer);
    //  this.setLoaderOption({
    //    options: {
    //      postcss: [
    //        require('autoprefixer')(prefixerOption)
    //      ]
    //    }
    //  });
    //}
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

  addEntry(name, value) {
    const entry = {};
    entry[name] = value;
    this.setOption({ entry });
  }

  initEntry() {
    const entry = Utils.getEntry(this.config, this.type);
    this.setOption({ entry });
  }

  addPack(name = {}, value, useCommonsChunk = false) {
    if (Utils.isObject(name)) {
      Object.keys(name).forEach(packName => {
        this.addPack(packName, name[packName]);
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
}

module.exports = WebpackBaseBuilder;