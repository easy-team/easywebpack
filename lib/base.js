'use strict';
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const chalk = require('chalk');
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
    this.config = this.utils.cloneDeep(config);
    this.logger = new Logger(this.config.logger, this);
    this.init();
  }

  init() {
    this.initEnv();
    this.initConfig();
    this.initialize();
    this.logger.env();
  }

  initConfig() {
    this.options = this.config.options;
    this.loaders = this.utils.cloneDeep(require('../config/loader'));
    this.plugins = this.utils.cloneDeep(require('../config/plugin'));
    const defaultPkg = require('../package.json');
    const projectPkg = require(path.join(this.config.baseDir, 'package.json'));
    this.dependencies = this.utils.getDeps(projectPkg.devDependencies, defaultPkg.fullDependencies);
  }

  initCreate() {
    if (this.config.create) {
      this.config.create.bind(this)();
    }
    const onName = `on${this.type.replace(/^\S/, m => m.toUpperCase())}`;
    if (this.config[onName] && this.utils.isFunction(this.config[onName])) {
      this.config[onName].apply(this);
    }
  }

  mergeConfig(config) {
    this.config = merge(this.config, config);
    this.setOption(config.options);
    this.initialize(true);
  }

  mergeLoader(loaders, target) {
    target = target || this.loaders;
    const sourceLoaders = this.utils.cloneDeep(loaders);
    Object.keys(sourceLoaders).forEach(name => {
      const sourceLoader = sourceLoaders[name];
      if (sourceLoader.loader) { // single loader config
        sourceLoader.use = [{ loader: sourceLoader.loader, options: sourceLoader.options || {} }];
      }
      const loader = target[name];
      if (loader) {
        if (utils.isBoolean(sourceLoader)) {
          target[name].enable = sourceLoader;
        } else if (sourceLoader.use) {
          target[name] = merge(target[name], sourceLoader);
          target[name].use = sourceLoader.use;
        } else {
          target[name] = merge(target[name], sourceLoader);
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
          if (configPlugin.args) {
            if (target[name].concatArgs) {
              target[name].concatArgs = target[name].concatArgs.concat(target[name].args).concat(configPlugin.args);
            } else {
              target[name].concatArgs = [].concat(target[name].args).concat(configPlugin.args);
            }
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
          const label = this.utils.getLoaderLabel(loader);
          const options = this.merge(loaderOptions[label], { options: itemLoader.options });
          if (utils.isString(loader)) {
            itemLoader.use.splice(index, 1, this.merge({ loader }, options));
          } else if (utils.isObject(loader) && utils.isString(loader.loader)) {
            itemLoader.use[index] = this.merge(itemLoader.use[index], options);
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
    const loaderNames = Object.keys(loaders).filter(name => {
      return name !== 'options'; // except loaders.options, this `options` property is global loader options key
    });
    loaderNames.forEach(name => {
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
    loaderNames.forEach(name => {
      const itemLoader = loaders[name];
      ['type', 'enable', 'postcss', 'framework', 'loader', 'options'].forEach(propery => {
        delete itemLoader[propery];
      });
    });
    return webpackLoaders;
  }

  installLoader(loaders) {
    const dependencies = this.dependencies;
    const modules = this.options.resolveLoader && this.options.resolveLoader.modules;
    const webpackLoaders = this.createLoader(loaders);
    this.utils.installLoader(webpackLoaders, dependencies, modules, this.config.install);
    return webpackLoaders;
  }

  createWebpackLoader() {
    this.mergeLoader(this.config.loaders);
    this.prepareCssModuleLoader(this.loaders);
    this.prepareLoaderOption(this.loaders, this.merge(this.config.loaderOptions, this.config.loaders.options));
    return this.installLoader(this.loaders);
  }

  createPlugin(plugins) {
    const webpackPlugins = [];
    const modules = this.options.resolveLoader && this.options.resolveLoader.modules;
    Object.keys(plugins).forEach(name => {
      const configInfo = plugins[name];
      if (this.isUse(configInfo)) {
        let plugin;
        let pluginName;
        if (utils.isObject(configInfo.name)) { // plugin object
          plugin = configInfo.name;
          pluginName = configInfo.name.constructor && configInfo.name.constructor.name;
        } else if (utils.isString(configInfo.name) || utils.isFunction(configInfo.name)) {
          let Clazz = configInfo.name;
          if (utils.isString(configInfo.name)) {
            pluginName = configInfo.name;
            Clazz = this.utils.requireModule(configInfo.name, modules);
          }
          if (configInfo.entry) {
            Clazz = Clazz[configInfo.entry];
          }
          assert(Clazz, chalk.red(`create plugin ${pluginName} error, please check the npm module whether installed`));
          if (configInfo.args || configInfo.concatArgs) {
            const args = this.parsePluginArgs(configInfo);
            plugin = new (Function.prototype.bind.apply(Clazz, [null].concat(args)))();
          } else {
            plugin = new Clazz();
          }
        }
        if (plugin) {
          plugin.__plugin__ = pluginName;
          plugin.__lable__ = name;
          webpackPlugins.push(plugin);
        }
      }
    });
    return webpackPlugins;
  }

  installPlugin(plugins) {
    const modules = this.options.resolveLoader && this.options.resolveLoader.modules;
    const dependencies = this.dependencies;
    const enablePlugins = {};
    Object.keys(plugins).forEach(name => {
      const pluginInfo = plugins[name];
      if (this.isUse(pluginInfo)) {
        enablePlugins[name] = pluginInfo;
      }
    });
    return this.utils.installPlugin(enablePlugins, dependencies, modules, this.config.install);
  }

  createWebpackPlugin() {
    this.mergePlugin(this.config.plugins);
    this.installPlugin(this.plugins);
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

  initEnv(config = {}, reset) {
    this.env = this.config.env || config.env || 'dev'; // local/dev, test, prod
    this.dev = false;
    this.test = false;
    this.prod = false;
    if (this.env === 'test') {
      this.test = true;
      process.env.NODE_ENV = process.env.NODE_ENV || 'development';
      if (reset) {
        this.config = merge(this.config, Config.testConfig, config);
      } else {
        this.config = merge(Config.defaultConfig, Config.testConfig, this.config, config);
      }
    } else if (this.env === 'prod') {
      this.prod = true;
      process.env.NODE_ENV = process.env.NODE_ENV || 'production';
      if (reset) {
        this.config = merge(this.config, Config.prodConfig, config);
      } else {
        this.config = merge(Config.defaultConfig, Config.prodConfig, this.config, config);
      }
    } else {
      this.dev = true;
      process.env.NODE_ENV = process.env.NODE_ENV || 'development';
      if (reset) {
        this.config = merge(this.config, Config.devConfig, config);
      } else {
        this.config = merge(Config.defaultConfig, Config.devConfig, this.config, config);
      }
    }
  }

  initialize(reset) {
    const config = this.config;
    this.setPrefix(config.prefix);
    this.setAlias(config.alias);
    this.setDevTool(config.devtool);
    this.setBuildPath(config.buildPath, reset);
    this.setPublicPath(config.publicPath, reset);
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
    this.initEnv(merge({ env }, config), true);
    this.initialize();
  }

  setConfig(config) {
    this.mergeConfig(config);
  }

  setEntry(entry) {
    this.config.entry = entry;
  }

  setPrefix(prefix) {
    this.config.prefix = prefix;
    this.prefix = prefix;
  }

  setExtensions(extension) {
    if (extension) {
      const extensions = this.options.resolve && this.options.resolve.extensions || [];
      const newExtensions = Array.isArray(extension) ? extension : [extension];
      newExtensions.forEach(ext => {
        if (!extensions.includes(ext)) {
          extensions.push(ext);
        }
      });
      this.options.resolve.extensions = extensions;
    }
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
    this.plugins.define.concatArgs = [].concat(this.plugins.define.concatArgs || this.plugins.define.args).concat(defines);
  }

  setMiniImage(miniImage) {
    this.plugins.imagemini = merge(this.plugins.imagemini, { enable: utils.isTrue(miniImage) });
  }

  setMiniJs(miniJs) {
    this.plugins.uglifyJs = merge(this.plugins.uglifyJs, { enable: utils.isTrue(miniJs) });
  }

  setMiniCss(miniCss) {
    this.config.loaders.options = merge(this.config.loaders.options, {
      css: {
        options: {
          minimize: utils.isTrue(miniCss)
        }
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

  setOption(option, override) {
    this.options = override ? option : merge(this.options, option);
  }

  setBuildPath(buildPath) {
    this.buildPath = utils.normalizePath(buildPath, this.config.baseDir);
    this.config.buildPath = this.buildPath;
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
    if (!/^(https?:|\/\/?)/.test(this.publicPath)) {
      this.publicPath = `/${this.publicPath}`;
    }
    this.config.publicPath = this.publicPath;
  }

  setCDN(cdnUrl, cdnDynamicDir) {
    if (cdnUrl) {
      const publicPath = cdnDynamicDir ? utils.joinPath(cdnUrl, cdnDynamicDir) : cdnUrl;
      this.setPublicPath(publicPath);
    }
  }

  setProxy(proxy) {
    this.proxy = proxy;
    this.config.proxy = proxy;
  }

  setDevMode(port, proxy) {
    this.config.port = port || 9000;
    if (proxy !== undefined) {
      this.config.proxy = proxy;
    }
    const host = utils.getHost(this.config.port);
    this.setPublicPath(utils.joinPath(host, this.publicPath.replace(host, '')));
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
    assert(this.config.entry || this.options.entry, 'webpack entry is empty, please call setEntry or setHtml');
  }

  createFileName() {
    if (this.config.fileHash) {
      this.config.filename = utils.assetsPath(this.prefix, `js/[name].[chunkhash:${this.config.hashLength}].js`);
      this.config.chunkFilename = utils.assetsPath(this.prefix, `js/chunk/[name].[chunkhash:${this.config.hashLength}].js`);
    } else {
      this.config.filename = utils.assetsPath(this.prefix, 'js/[name].js');
      this.config.chunkFilename = utils.assetsPath(this.prefix, 'js/chunk/[name].js');
    }
  }

  createImageName() {
    if (this.config.imageHash) {
      this.config.imageName = utils.assetsPath(this.prefix, `img/[name].[hash:${this.config.hashLength}].[ext]`);
    } else {
      this.config.imageName = utils.assetsPath(this.prefix, 'img/[name].[ext]');
    }
  }

  createCssName() {
    if (this.config.cssHash) {
      this.config.cssName = utils.assetsPath(this.prefix, `css/[name].[contenthash:${this.config.hashLength}].css`);
    } else {
      this.config.cssName = utils.assetsPath(this.prefix, 'css/[name].css');
    }
  }

  createFrontName() {
    if (this.config.fontHash) {
      this.config.frontName = utils.assetsPath(this.prefix, `font/[name].[hash:${this.config.hashLength}].[ext]`);
    } else {
      this.config.frontName = utils.assetsPath(this.prefix, 'font/[name].[ext]');
    }
  }
}

module.exports = WebpackBaseBuilder;