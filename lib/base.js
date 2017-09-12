'use strict';
const path = require('path').posix;
const fs = require('fs');
const assert = require('assert');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const merge = WebpackTool.merge;
const utils = require('../utils/utils');
const Logger = require('../utils/logger');
const Config = require('../config/config');

class WebpackBaseBuilder {
  constructor(config = {}) {
    this.webpack = webpack;
    this.merge = merge;
    this.utils = utils;
    this.packs = {};
    this.options = {};
    this.config = this.utils.cloneDeep(config);
    this.loaders = this.utils.cloneDeep(require('../config/loader'));
    this.plugins = this.utils.cloneDeep(require('../config/plugin'));
    this.logger = new Logger(this.config.logger, this);
    this.init();
  }

  init() {
    this.initEnv();
    this.initialize();
    this.setExtensions(['.js', '.jsx']);
    this.setResolveLoader({ modules: [path.join(__dirname, '../node_modules'), path.join(this.config.baseDir, 'node_modules'), 'node_modules'] });
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

  mergeConfig(config) {
    this.config = this.merge(this.config, config);
  }

  mergeLoader(loaders, target) {
    target = target || this.loaders;
    const sourceLoaders = this.utils.cloneDeep(loaders);
    Object.keys(sourceLoaders).forEach(name => {
      const loader = target[name];
      if (loader) {
        if (utils.isBoolean(loader)) {
          target[name].enable = loader;
        } else {
          target[name] = merge(target[name], sourceLoaders[name]);
        }
      } else {
        target[name] = sourceLoaders[name];
      }
    });
    return target;
  }

  mergePlugin(plugins, target) {
    target = target || this.plugins;
    const sourcePlugins = this.utils.cloneDeep(plugins);
    Object.keys(sourcePlugins).forEach(name => {
      const configPlugin = sourcePlugins[name];
      if (target[name]) {
        if (utils.isBoolean(configPlugin)) {
          target[name].enable = configPlugin;
        } else if (configPlugin.name && configPlugin.merge === false) { // override
          target[name] = configPlugin;
        } else {
          if (configPlugin.hasOwnProperty('args')) {
            target[name].concatArgs = [target[name].args, configPlugin.args];
          }
          const cloneConfigPlugin = this.utils.cloneDeep(configPlugin);
          delete cloneConfigPlugin.args;
          target[name] = this.merge(target[name], cloneConfigPlugin);
        }
      } else {
        target[name] = configPlugin;
      }
    });
    return target;
  }

  parsePluginArgs(plugin) {
    const args = utils.isFunction(plugin.args) ? plugin.args.apply(this) : plugin.args;
    const concatArgs = (plugin.concatArgs || []).map(arg => {
      return utils.isFunction(arg) ? arg.apply(this) : arg;
    });
    if (!concatArgs.length) {
      return args;
    }
    const length = concatArgs.length;
    if (Array.isArray(args) || utils.isString(args) || utils.isBoolean(args) || (utils.isObject(args) && args.test)) { // override
      return concatArgs[length - 1];
    }
    return concatArgs.reduce((arg, itemArgs) => {
      return merge(arg, itemArgs);
    }, args);
  }

  getLoaderByName(name) {
    const defaultLoaders = this.utils.cloneDeep(this.loaders);
    const configLoaders = this.config.loaders;
    return this.mergeLoader(configLoaders, defaultLoaders)[name];
  }

  getPluginByName(name) {
    const defaultPlugins = this.utils.cloneDeep(this.plugins);
    const configPlugins = this.config.plugins;
    const plugins = this.mergePlugin(configPlugins, defaultPlugins);
    if (plugins[name]) {
      plugins[name].args = this.parsePluginArgs(plugins[name]);
    }
    return plugins[name];
  }

  getCommonsChunk() {
    const commonsChunk = this.getPluginByName('commonsChunk');
    const names = commonsChunk && commonsChunk.args && commonsChunk.args.names;
    return Array.isArray(names) ? names : [].concat(names || []);
  }

  isType(type) {
    return type === undefined || type === this.type || (Array.isArray(type) && type.includes(this.type));
  }

  isEnv(env) {
    return env === undefined || env === this.env || (Array.isArray(env) && env.includes(this.env));
  }

  isEnable(enable) {
    if (utils.isFunction(enable)) {
      return enable.apply(this);
    }
    return utils.isTrue(enable);
  }

  isUse(name, range = 'plugin') {
    if (this.utils.isBoolean(name)) {
      return name;
    }
    const configInfo = this.utils.isObject(name) ? name : (range === 'plugin' ? this.getPluginByName(name) : this.getLoaderByName(name));
    return configInfo && this.isEnable(configInfo.enable) && this.isType(configInfo.type) && this.isEnv(configInfo.env);
  }

  createFrameworkLoader(styleLoader = 'style-loader') {
    const preLoaders = {};
    const loaders = {};
    const extract = this.isUse('extract');
    Object.keys(this.loaders).forEach(name => {
      const itemLoader = this.loaders[name];
      if (itemLoader.framework && (itemLoader.enable || itemLoader.enable === undefined)) {
        const useLoaders = this.utils.cloneDeep(itemLoader).use;
        if (name !== 'css') {
          const preLoader = useLoaders[useLoaders.length - 1]; // get last loader
          if (utils.isString(preLoader)) {
            preLoaders[name] = preLoader;
          } else if (utils.isObject(preLoader) && preLoader.options) {
            preLoaders[name] = `${preLoader.loader}?${JSON.stringify(preLoader.options)}`;
          } else {
            preLoaders[name] = preLoader.loader;
          }
        }
        if (extract) {
          useLoaders.splice(0, 2);
          loaders[name] = ExtractTextPlugin.extract({ fallback: styleLoader, use: useLoaders });
        } else {
          useLoaders.unshift(styleLoader);
          loaders[name] = useLoaders;
        }
      }
    });
    return { preLoaders, loaders };
  }

  prepareCssModuleLoader(loaders) {
    const cssLoaderName = 'css-loader';
    const loaderNames = Object.keys(loaders);
    loaderNames.forEach(name => {
      const itemLoader = loaders[name];
      if (Array.isArray(itemLoader.use)) {
        const cssLoaderIndex = itemLoader.use.findIndex(loader => {
          return loader === cssLoaderName || (utils.isObject(loader) && loader.loader === cssLoaderName);
        });
        const include = [path.join(this.config.baseDir, 'app/web/page/css/module')];
        if (cssLoaderIndex > -1) {
          const cssModuleLoader = this.utils.cloneDeep(itemLoader);
          const cssModuleName = `${name}_module`;
          const cssModuleLoaderOption = {
            options: {
              modules: true,
              importLoaders: cssModuleLoader.use.length - cssLoaderIndex
            }
          };
          const oldCssLoader = cssModuleLoader.use[cssLoaderIndex];
          const newCssLoader = merge(utils.isString(oldCssLoader) ? { loader: cssLoaderName } : oldCssLoader, cssModuleLoaderOption);
          cssModuleLoader.include = [].concat(itemLoader.include || []).concat(include);
          cssModuleLoader.use[cssLoaderIndex] = newCssLoader;
          if (this.type === 'server') {
            cssModuleLoader.use.unshift('isomorphic-style-loader');
          }
          loaders[cssModuleName] = cssModuleLoader;
          itemLoader.exclude = [].concat(itemLoader.exclude || []).concat(include);
        }
      }
    });
  }

  prepareLoaderOption(loaders, loaderOptions) {
    const extract = this.isUse('extract');
    Object.keys(loaders).forEach(name => {
      const itemLoader = loaders[name];
      if (Array.isArray(itemLoader.use)) {
        if (itemLoader.postcss) {
          const postcssIndex = ['css', 'css_module'].includes(name) ? itemLoader.use.length : itemLoader.use.length - 1;
          itemLoader.use.splice(postcssIndex, 0, 'postcss-loader');
        }
        itemLoader.use.forEach((loader, index) => {
          if (utils.isString(loader)) {
            const options = loaderOptions[loader] || loaderOptions[loader.replace('-loader', '')];
            options && itemLoader.use.splice(index, 1, { loader, options });
          } else if (utils.isObject(loader) && utils.isString(loader.loader)) {
            const options = loaderOptions[loader.loader] || loaderOptions[loader.loader.replace('-loader', '')];
            if (options) {
              itemLoader.use[index] = this.merge(itemLoader.use[index], { options });
            }
          }
        });
      }
      if (itemLoader.framework && extract) {
        itemLoader.use = ExtractTextPlugin.extract({ fallback: 'style-loader', use: itemLoader.use });
      }
    });
    return loaders;
  }

  createLoader(loaders) {
    const webpackLoaders = [];
    Object.keys(loaders).forEach(name => {
      const itemLoader = loaders[name];
      if (this.isUse(itemLoader)) {
        if (utils.isFunction(itemLoader.use)) {
          itemLoader.use = itemLoader.use.apply(this);
        }
        if (Array.isArray(itemLoader.use)) {
          itemLoader.use.forEach((loader, index) => {
            if (utils.isObject(loader) && utils.isFunction(loader.fn)) {
              itemLoader.use[index] = merge(loader, loader.fn.apply(this));
              delete itemLoader.use[index].fn;
            }
          });
        }
        webpackLoaders.push(itemLoader);
      }
    });

    // clean custom property
    Object.keys(loaders).forEach(name => {
      const itemLoader = loaders[name];
      ['type', 'enable', 'postcss', 'framework'].forEach(propery => {
        delete itemLoader[propery];
      });
    });
    return webpackLoaders;
  }

  createWebpackLoader() {
    this.mergeLoader(this.config.loaders);
    this.prepareCssModuleLoader(this.loaders);
    this.prepareLoaderOption(this.loaders, this.config.loaderOptions);
    return this.createLoader(this.loaders);
  }

  createPlugin(plugins) {
    const webpackPlugins = [];
    Object.keys(plugins).forEach(name => {
      const configInfo = plugins[name];
      if (this.isUse(configInfo)) {
        if (utils.isObject(configInfo.name)) { // plugin object initialize
          webpackPlugins.push(configInfo.name);
        } else if (utils.isString(configInfo.name) || utils.isFunction(configInfo.name)) {
          let Clazz = utils.isString(configInfo.name) ? require(configInfo.name) : configInfo.name;
          if (configInfo.entry) {
            Clazz = Clazz[configInfo.entry];
          }
          if (configInfo.args || configInfo.concatArgs) {
            const args = this.parsePluginArgs(configInfo);
            webpackPlugins.push(new (Function.prototype.bind.apply(Clazz, [null].concat(args)))());
          } else {
            webpackPlugins.push(new Clazz());
          }
        }
      }
    });
    return webpackPlugins;
  }

  createWebpackPlugin() {
    this.mergePlugin(this.config.plugins);
    return this.createPlugin(this.plugins);
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
    this.setCDN(config.cdn.url, config.cdn.dynamicDir);
    if (this.dev) {
      this.setDevMode(config.port, config.proxy);
    }
  }

  initEntry() {
    const entry = utils.getEntry(this.config, this.type);
    this.setOption({ entry });
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

  setDefine(defines) {
    this.config.plugins.define = merge(this.config.plugins.define, { args: defines });
  }

  setMiniImage(miniImage) {
    this.plugins.imagemini = merge(this.plugins.imagemini, { enable: utils.isTrue(miniImage) });
  }

  setMiniJs(miniJs) {
    this.plugins.uglifyJs = merge(this.plugins.uglifyJs, { enable: utils.isTrue(miniJs) });
  }

  setMiniCss(miniCss) {
    this.config.loaderOptions = merge(this.config.loaderOptions, {
      css: {
        minimize: utils.isTrue(miniCss)
      }
    });
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
    if (this.utils.isObject(name)) {
      Object.assign(entry, name);
    } else {
      entry[name] = value;
    }
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
    this.buildPath = path.posix.isAbsolute(buildPath) ? buildPath : path.posix.join(this.config.baseDir, buildPath);
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
    const testFile = path.posix.join(this.config.baseDir, '.webpack.js');
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