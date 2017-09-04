'use strict';
const path = require('path').posix;
const fs = require('fs');
const assert = require('assert');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const merge = WebpackTool.merge;
const utils = require('../utils/utils');
const cloneDeep = require('lodash.clonedeep');
const Logger = require('../utils/logger');
const Config = require('../config/config');

class WebpackBaseBuilder {
  constructor(config = {}) {
    this.webpack = webpack;
    this.merge = merge;
    this.utils = utils;
    this.options = {};
    this.packs = {};
    this.config = merge({}, config);
    this.loaders = require('../config/loader');
    this.plugins = require('../config/plugin');
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

  createFrameworkLoader(styleLoader = 'style-loader') {
    const preLoaders = {};
    const loaders = {};
    Object.keys(this.loaders).forEach(name => {
      const itemLoader = this.loaders[name];
      if (itemLoader.framework && (itemLoader.enable || itemLoader.enable === undefined)) {
        const useLoaders = cloneDeep(itemLoader).use;
        let postcssIndex = useLoaders.length - 1;
        if (name === 'css') {
          postcssIndex = useLoaders.length;
        } else {
          preLoaders[name] = useLoaders[useLoaders.length - 1]; // get last loader
        }
        if (itemLoader.postcss) {
          useLoaders.splice(postcssIndex, 0, 'postcss-loader');
        }
        if (this.config.cssExtract) {
          useLoaders.shift();// remove first default style-loader
          loaders[name] = ExtractTextPlugin.extract({ fallback: styleLoader, use: useLoaders });
        } else {
          useLoaders.splice(0, 1, styleLoader); // replace first style-loader
          loaders[name] = useLoaders;
        }
      }
    });
    return { preLoaders, loaders };
  }

  createWebpackLoader() {
    const loaders = [];
    Object.keys(this.loaders).forEach(name => {
      const enable = this.loaders[name].enable;
      const postcss = this.loaders[name].postcss;
      const itemLoader = cloneDeep(this.loaders[name]);
      ['enable', 'postcss', 'framework'].forEach(propery => {
        delete itemLoader[propery];
      });
      if (enable || enable === undefined) {
        if (utils.isFunction(itemLoader.use)) {
          itemLoader.use = itemLoader.use.apply(this);
        }
        if (postcss && itemLoader.use) {
          const postcssIndex = name === 'css' ? itemLoader.use.length : itemLoader.use.length - 1;
          itemLoader.use.splice(postcssIndex, 0, 'postcss-loader');
        }
        if (utils.isObject(itemLoader)) {
          loaders.push(itemLoader);
        } else if (utils.isFunction(itemLoader)) {
          loaders.push(itemLoader());
        }
      }
    });
    return loaders;
  }

  createWebpackPlugin() {
    const plugins = this.config.plugin.plugins || [];
    Object.keys(this.plugins).forEach(name => {
      const defaultConfig = this.plugins[name];
      const customConfig = this.config.plugin[name] || {};
      const configInfo = merge(defaultConfig, customConfig);
      const isType = configInfo.type === undefined || configInfo.type === this.type || (Array.isArray(configInfo.type) && configInfo.type.includes(this.type));
      const isEnv = configInfo.env === undefined || configInfo.env === this.env || (Array.isArray(configInfo.env) && configInfo.env.includes(this.env));
      if (isType && isEnv) {
        if (utils.isTrue(configInfo.enable) || (utils.isFunction(configInfo.enable) && configInfo.enable.apply(this))) {
          if (utils.isObject(configInfo.name)) { // plugin object initialize
            plugins.push(configInfo.name);
          } else if (utils.isString(configInfo.name) || utils.isFunction(configInfo.name)) {
            let Clazz = utils.isString(configInfo.name) ? require(configInfo.name) : configInfo.name;
            if (configInfo.entry) {
              Clazz = Clazz[configInfo.entry];
            }
            if (defaultConfig.args || customConfig.args) {
              const defaultArgs = utils.isFunction(defaultConfig.args) ? defaultConfig.args.apply(this) : defaultConfig.args;
              const customArgs = utils.isFunction(customConfig.args) ? customConfig.args.apply(this) : customConfig.args;
              const args = utils.isObject(defaultArgs) && utils.isObject(customArgs) ? merge(defaultArgs, customArgs) : customArgs || defaultArgs;
              plugins.push(new (Function.prototype.bind.apply(Clazz, [null].concat(args)))());
            } else {
              plugins.push(new Clazz());
            }
          }
        }
      }
    });
    return plugins;
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
    if (utils.isObject(name)) {
      Object.keys(name).forEach(key => {
        this.setAlias(key, name[key]);
      });
    } else {
      const alias = {};
      alias[name] = useBaseDir ? utils.normalizePath(value, this.config.baseDir) : value;
      this.options = merge(this.options, {
        resolve: { alias }
      });
    }
  }

  setMiniImage(miniImage) {
    this.plugins.imagemini = merge(this.plugins.imagemini, { enable: utils.isTrue(miniImage) });
  }

  setMiniJs(miniJs) {
    this.plugins.uglifyJs = merge(this.plugins.uglifyJs, { enable: utils.isTrue(miniJs) });
  }

  setMiniCss(miniCss) {
    // console.log(miniCss);
  }

  setAutoprefixer(prefixer, replace = true) {
    //const postcss = this.config.loaderOption && this.config.loaderOption.options && this.config.loaderOption.options.postcss;
    //if (prefixer === false && postcss) {
    //  this.config.loaderOption.options.postcss = postcss.filter(item => {
    //    if (utils.isObject(item) && item.postcssPlugin === 'autoprefixer') {
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
    const entry = utils.getEntry(this.config, this.type);
    this.setOption({ entry });
  }

  addPack(name = {}, value, useCommonsChunk = false) {
    if (utils.isObject(name)) {
      Object.keys(name).forEach(packName => {
        this.addPack(packName, name[packName]);
      });
    } else {
      const files = Array.isArray(value) ? value : [value];
      const normalizeFiles = files.map(file => {
        return utils.normalizePath(file, this.config.baseDir);
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
      this.publicPath = utils.joinPath(this.publicPath, publicPath);
    }
    this.publicPath = `${this.publicPath.replace(/\/$/, '')}/`;
  }

  setCDN(cdnUrl, cdnDynamicDir) {
    if (cdnUrl) {
      const publicPath = cdnDynamicDir ? utils.joinPath(cdnUrl, cdnDynamicDir) : cdnUrl;
      this.setPublicPath(publicPath);
    }
  }

  setProxy(proxy) {
    this.config.proxy = proxy;
  }

  setDevMode(port, proxy = false) {
    this.config.port = port || 9000;
    this.config.proxy = proxy;
    const host = utils.getHost(this.config.port);
    this.setPublicPath(utils.joinPath(host, this.config.publicPath));
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
      this.config.filename = utils.assetsPath(this.config.prefix, `js/[name].[chunkhash:${this.config.hashLength}].js`);
      this.config.chunkFilename = utils.assetsPath(this.config.prefix, `js/chunk/[name].[chunkhash:${this.config.hashLength}].js`);
    } else {
      this.config.filename = utils.assetsPath(this.config.prefix, 'js/[name].js');
      this.config.chunkFilename = utils.assetsPath(this.config.prefix, 'js/chunk/[name].js');
    }
  }

  createImageName() {
    if (this.config.imageHash) {
      this.config.imageName = utils.assetsPath(this.config.prefix, `img/[name].[hash:${this.config.hashLength}].[ext]`);
    } else {
      this.config.imageName = utils.assetsPath(this.config.prefix, 'img/[name].[ext]');
    }
  }

  createCssName() {
    if (this.config.cssHash) {
      this.config.cssName = utils.assetsPath(this.config.prefix, `css/[name].[contenthash:${this.config.hashLength}].css`);
    } else {
      this.config.cssName = utils.assetsPath(this.config.prefix, 'css/[name].css');
    }
  }

  createFrontName() {
    if (this.config.fontHash) {
      this.config.frontName = utils.assetsPath(this.config.prefix, `font/[name].[hash:${this.config.hashLength}].[ext]`);
    } else {
      this.config.frontName = utils.assetsPath(this.config.prefix, 'font/[name].[ext]');
    }
  }
}

module.exports = WebpackBaseBuilder;