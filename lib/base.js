'use strict';
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const chalk = require('chalk');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const Config = require('./config');
const STYLE_LOADER = 'style-loader';
class WebpackBaseBuilder extends Config {
  constructor(config = {}) {
    super(config);
    this.init(config);
  }

  init(config) {
    this.t1 = Date.now();
    this.initConfig(config);
    this.initEnv(config);
    this.initStyleLoader(STYLE_LOADER);
  }

  initEnv(config = {}) {
    this.env = config.env || 'dev'; // local/dev, test, prod
    this.dev = false;
    this.test = false;
    this.prod = false;
    const defaultConfig = require('../config/config');
    this.mergeConfig(defaultConfig.config, false);
    if (this.env === 'prod') {
      this.prod = true;
      this.mergeConfig(defaultConfig.prodConfig, false);
    } else if (this.env === 'test') {
      this.test = true;
      this.mergeConfig(defaultConfig.testConfig, false);
    } else {
      this.dev = true;
      this.mergeConfig(defaultConfig.devConfig, false);
    }
    this.mergeConfig(this.outerConfig, true, this.config);
    this.config.env = this.env;
  }

  initialize(config, reset) {
    config = config || this.config;
    this.setPort(config.port);
    this.setEgg(config.egg);
    this.setPrefix(config.prefix);
    this.setBuildPath(config.buildPath);
    this.setPublicPath(config.publicPath, reset);
    this.setHashLength(config.hashLength);
    this.setFileNameHash(config.hash);
    this.setImageHash(config.hash);
    this.setFontHash(config.hash);
    this.setCssHash(config.hash);
    this.setMiniCss(config.miniCss);
    this.setMiniImage(config.miniImage);
    this.setMiniJs(config.miniJs);
    this.setCssExtract(config.cssExtract);
    this.setHot(config.hot);
    this.setCDN(config.cdn);
    this.setProxy(config.proxy);
    this.setHost();
    this.initialized = true;
  }


  setConfig(config) {
    this.mergeConfig(config);
  }

  setEnv(env) {
    this.initEnv({ env });
    this.initialize();
  }

  addLoader(loader) {
    if (loader.test && (loader.use || loader.loader)) {
      const loaderInfo = {};
      const loaderName = [loader.loader || ''];
      loader.use && loader.use.forEach(item => {
        if (this.utils.isString(item)) {
          loaderName.push(item.replace('-loader', ''));
        } else if (this.utils.isObject(item) && this.utils.isString(item.loader)) {
          loaderName.push(item.loader.replace('-loader', ''));
        }
      });
      loaderInfo[loaderName.join('-')] = loader;
      this.mergeLoader(loaderInfo);
    } else {
      this.mergeLoader(loader);
    }
  }

  mergeConfig(config = {}, needInitialize = true, sourceConfig) {
    this.mergeWebpackConfig(this.webpackConfig, this.analysisWebpackConfig(sourceConfig || config));
    Object.keys(config).forEach(key => {
      const value = config[key];
      switch (key) {
        case 'loaders':
          this.mergeLoader(value);
          break;
        case 'plugins':
          this.mergePlugin(value);
          break;
        default:
          this.config[key] = this.safeMerge(this.config[key], value);
          break;
      }
    });
    if (needInitialize) {
      this.initialize(this.config, this.initialized);
      // manifest 兼容低版本
      this.adapter.adapterManifestPlugin(this.configPlugins, this.config);
    }
  }

  mergeLoader(loaders = {}, target) {
    target = target || this.loaders;
    const cloneLoaders = this.utils.cloneDeep(loaders);
    const sourceLoaders = Array.isArray(cloneLoaders) ? {} : cloneLoaders;
    if (Array.isArray(cloneLoaders)) {
      cloneLoaders.forEach(loader => {
        if (this.isWebpackLoader(loader)) {
          const label = this.utils.getLoaderLabel(loader);
          sourceLoaders[label] = this.merge(loader, { enable: true });
        } else if (this.utils.isObject(loader) && Object.keys(loader).length === 1) {
          const label = Object.keys(loader)[0];
          sourceLoaders[label] = loader[label];
        }
      });
    }
    Object.keys(sourceLoaders).forEach(name => {
      const sourceLoader = sourceLoaders[name];
      if (sourceLoader.loader) { // single loader config
        sourceLoader.use = [{ loader: sourceLoader.loader, options: sourceLoader.options || {} }];
      }
      const loader = target[name];
      if (loader) {
        if (this.utils.isObject(sourceLoader) && sourceLoader.enable === undefined) {
          target[name].enable = true;
        }
        if (this.utils.isBoolean(sourceLoader)) {
          target[name].enable = sourceLoader;
        } else if (sourceLoader.use) {
          target[name] = this.merge(target[name], sourceLoader);
          target[name].use = sourceLoader.use;
        } else {
          target[name] = this.merge(target[name], sourceLoader);
        }
      } else {
        target[name] = sourceLoaders[name];
      }
    });
    return target;
  }

  addPlugin(plugin) {
    if (this.isWebpackPlugin(plugin)) {
      const pluginInfo = {};
      pluginInfo[plugin.constructor.name] = plugin;
      this.mergePlugin(pluginInfo);
    } else {
      this.mergePlugin(plugin);
    }
  }

  mergePlugin(plugins = {}, target) {
    target = target || this.plugins;
    const clonePlugins = this.utils.cloneDeep(plugins);
    const sourcePlugins = Array.isArray(clonePlugins) ? {} : clonePlugins;
    // 支持Webpack原生plugin配置
    if (Array.isArray(clonePlugins)) {
      clonePlugins.forEach(plugin => {
        if (this.isWebpackPlugin(plugin)) {
          sourcePlugins[plugin.constructor.name] = plugin;
        } else if (this.utils.isObject(plugin)) { // 兼容 Webpack 自定义 plugin配置
          if (plugin.name) {
            if (this.utils.isString(plugin.name)) {
              sourcePlugins[plugin.label || plugin.name] = plugin;
            } else if (this.isWebpackPlugin(plugin.name)) {
              sourcePlugins[plugin.label || plugin.name.constructor.name] = plugin;
            } else if (this.utils.isObject(plugin) && this.utils.isFunction(plugin.name) && plugin.name.name) {
              sourcePlugins[plugin.name.name] = plugin;
            }
          } else if (Object.keys(plugin).length === 1) {
            const label = Object.keys(plugin)[0];
            sourcePlugins[label] = plugin[label];
          }
        }
      });
    }
    // 支持Webpack 自定义 plugin配置
    Object.keys(sourcePlugins).forEach(name => {
      const configPlugin = sourcePlugins[name];
      if (target[name]) {
        // enable function 优先级高
        if (this.utils.isObject(configPlugin) && configPlugin.enable === undefined) {
          target[name].enable = true;
        }
        if (this.utils.isFunction(configPlugin.enable)) {
          target[name].enable = configPlugin.enable.apply(this);
        } else if (this.utils.isBoolean(configPlugin)) {
          target[name].enable = configPlugin;
        } else if (configPlugin.name || this.isWebpackPlugin(configPlugin)) { // 直接覆盖
          target[name] = configPlugin;
        } else {
          // 如果 name 和 args 不存在, configPlugin直接作为args, 配置是可以省去 args key
          const args = configPlugin.args ? configPlugin.args : configPlugin;
          if (target[name].concatArgs) {
            target[name].concatArgs = target[name].concatArgs.concat(args);
          } else {
            target[name].concatArgs = [].concat(target[name].args).concat(args);
          }
          const cloneConfigPlugin = this.utils.cloneDeep(configPlugin);
          delete cloneConfigPlugin.enable;
          delete cloneConfigPlugin.args;
          target[name] = this.merge(target[name], cloneConfigPlugin);
        }
      } else if (this.isWebpackPlugin(configPlugin) || this.isConfigPlugin(configPlugin)) {
        target[name] = configPlugin;
      }
    });

    return target;
  }

  parsePluginArgs(plugin) {
    try {
      const args = this.utils.isFunction(plugin.args) ? plugin.args.apply(this) : plugin.args;
      const concatArgs = (plugin.concatArgs || []).map(arg => {
        return this.utils.isFunction(arg) ? arg.apply(this) : arg;
      });
      if (!concatArgs.length) {
        return args;
      }
      const length = concatArgs.length;
      if (Array.isArray(args) || this.utils.isString(args) || this.utils.isBoolean(args) || (this.utils.isObject(args) && args.test)) { // override
        return concatArgs[length - 1];
      }
      return concatArgs.reduce((arg, itemArgs) => {
        return this.merge(arg, itemArgs);
      }, args);
    } catch (e) {
      console.error('parsePluginArgs:', plugin, e);
    }
  }

  getLoaderByName(name) {
    const defaultLoaders = this.utils.cloneDeep(this.loaders);
    return this.mergeLoader(this.configLoaders, defaultLoaders)[name];
  }

  getPluginByName(name) {
    const defaultPlugins = this.utils.cloneDeep(this.plugins);
    const plugins = this.mergePlugin(this.configPlugins, defaultPlugins);
    if (plugins[name]) {
      plugins[name].args = this.parsePluginArgs(plugins[name]);
    }
    return plugins[name];
  }

  getCommonsChunk(useRuntime = true) {
    let commonsChunks = [];
    if (useRuntime) {
      const runtime = this.getPluginByName('runtime');
      if (runtime.enable) {
        if (runtime && runtime.args) {
          commonsChunks = commonsChunks.concat(runtime.args.names || runtime.args.name || []);
        }
      }
    }
    const common = this.getPluginByName('commonsChunk');
    if (common.enable) {
      if (common && common.args) {
        commonsChunks = commonsChunks.concat(common.args.names || common.args.name || []);
      }
    }
    return commonsChunks;
  }


  createFileOption() {
    this.createFileName();
    this.createImageName();
    this.createCssName();
    this.createFrontName();
  }

  createFrameworkLoader(styleLoader = 'style-loader', options) {
    const preLoaders = {};
    const loaders = {};
    const extract = this.isUse('extract');
    Object.keys(this.loaders).forEach(name => {
      const itemLoader = this.loaders[name];
      if (itemLoader.framework && (itemLoader.enable || itemLoader.enable === undefined)) {
        const useLoaders = this.utils.cloneDeep(itemLoader).use;
        if (name !== 'css') {
          const preLoader = useLoaders[useLoaders.length - 1]; // get last loader
          if (this.utils.isString(preLoader)) {
            preLoaders[name] = preLoader;
          } else if (this.utils.isObject(preLoader) && preLoader.options) {
            preLoaders[name] = `${preLoader.loader}?${JSON.stringify(preLoader.options)}`;
          } else {
            preLoaders[name] = preLoader.loader;
          }
        }
        if (extract) {
          useLoaders.forEach(item => {
            if (item.loader === STYLE_LOADER) {
              item.loader = styleLoader;
            }
          });
          loaders[name] = useLoaders;
        } else {
          const filterLoaders = useLoaders.filter(item => {
            return item.loader !== STYLE_LOADER && item.loader !== styleLoader;
          });
          filterLoaders.unshift({ loader: styleLoader, options });
          loaders[name] = filterLoaders;
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
      if (this.utils.isFunction(itemLoader.use)) {
        itemLoader.use = itemLoader.use.apply(this);
      }
      if (Array.isArray(itemLoader.use)) {
        if (itemLoader.postcss) {
          const postcssIndex = ['css', 'css_module'].includes(name) ? itemLoader.use.length : itemLoader.use.length - 1;
          const postcssLoader = this.createPostCssLoader(loaderOptions && loaderOptions.postcss);
          itemLoader.use.splice(postcssIndex, 0, postcssLoader);
        }
        itemLoader.use.forEach((loader, index) => {
          const label = this.utils.getLoaderLabel(loader);
          const options = this.merge(loaderOptions[label], { options: itemLoader.options });
          if (this.utils.isString(loader)) {
            itemLoader.use.splice(index, 1, this.merge({ loader }, options));
          } else if (this.utils.isObject(loader) && this.utils.isString(loader.loader)) {
            itemLoader.use[index] = this.merge(itemLoader.use[index], options);
          }
        });
      }
      if (itemLoader.framework && this.styleLoader && this.styleLoader.loader) {
        if (extract) {
          itemLoader.use = ExtractTextPlugin.extract({ fallback: this.styleLoader.loader, use: itemLoader.use });
        } else {
          const hasStyleLoader = itemLoader.use.find(loader => {
            return loader === this.styleLoader.loader || (this.utils.isObject(loader) && loader.loader === this.styleLoader.loader);
          });
          if (!hasStyleLoader) {
            itemLoader.use.unshift(this.styleLoader);
          }
        }
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
        if (this.utils.isFunction(itemLoader.use)) {
          itemLoader.use = itemLoader.use.apply(this);
        }
        if (Array.isArray(itemLoader.use)) {
          itemLoader.use.forEach((loader, index) => {
            if (this.utils.isObject(loader) && this.utils.isFunction(loader.fn)) {
              itemLoader.use[index] = this.merge(loader, loader.fn.apply(this));
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
    const modules = this.webpackConfig.resolveLoader && this.webpackConfig.resolveLoader.modules;
    const webpackLoaders = this.createLoader(loaders);
    this.utils.installLoader(webpackLoaders, dependencies, modules, this.config.install);
    return webpackLoaders;
  }

  adapterLoader(loaders) {
    this.adapter.adapterLoader(loaders, this.config, this.outerConfig);
  }

  createWebpackLoader() {
    this.mergeLoader(this.configLoaders);
    this.adapterLoader(this.loaders);
    this.prepareCssModuleLoader(this.loaders);
    this.prepareLoaderOption(this.loaders, this.merge(this.config.loaderOptions, this.loaders.options));
    return this.installLoader(this.loaders);
  }

  createPlugin(plugins) {
    const webpackPlugins = [];
    const modules = this.webpackConfig.resolveLoader && this.webpackConfig.resolveLoader.modules;
    Object.keys(plugins).forEach(name => {
      const configInfo = plugins[name];
      if (this.isUse(configInfo)) {
        let plugin;
        let pluginName;
        if (this.isWebpackPlugin(configInfo)) { // 如果直接是 new Plugin 方式
          plugin = configInfo;
          pluginName = configInfo.constructor.name;
        } else if (this.utils.isObject(configInfo.name)) { // plugin object
          plugin = configInfo.name;
          pluginName = plugin.constructor && plugin.constructor.name;
        } else if (this.utils.isString(configInfo.name) || this.utils.isFunction(configInfo.name)) {
          let Clazz = configInfo.name;
          if (this.utils.isString(configInfo.name)) {
            pluginName = configInfo.name;
            Clazz = this.utils.requireModule(configInfo.name, modules);
          } else if (this.utils.isFunction(configInfo.name)) {
            pluginName = configInfo.name.name;
          }
          assert(Clazz, chalk.red(`dynamic create plugin[${name}] error, please check the npm module [${pluginName}] whether installed. if not installed, please execute the command [npm install ${pluginName} --save-dev] in command line`));
          if (configInfo.entry) {
            Clazz = Clazz[configInfo.entry];
          }
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
    const modules = this.webpackConfig.resolveLoader && this.webpackConfig.resolveLoader.modules;
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

  adapterPlugin(plugins) {
    this.adapter.adapterPlugin(plugins, this.config, this.outerConfig);
  }

  createWebpackPlugin() {
    this.mergePlugin(this.configPlugins);
    this.installPlugin(this.plugins);
    this.adapterPlugin(this.plugins);
    return this.createPlugin(this.plugins);
  }

  createEntry() {
    const entry = this.utils.getEntry(this.config, this.type);
    this.setWebpackConfig({ entry });
  }

  get publicPath() {
    if (this.cdnUrl) {
      const configPublicPath = this.config.publicPath.replace(/\/$/, '');
      const configCdnUrl = this.cdnUrl.replace(/\/$/, '');
      if (configCdnUrl.endsWith(configPublicPath)) {
        return this.utils.normalizePublicPath(this.cdnUrl);
      }
      const publicPath = this.utils.joinPath(configCdnUrl, configPublicPath);
      return this.utils.normalizePublicPath(publicPath);
    } else if (this.dev && this.utils.isTrue(this.config.useHost)) {
      const publicPath = this.setHostPublicPath(this.config.publicPath);
      return this.utils.normalizePublicPath(publicPath);
    }
    return this.config.publicPath;
  }

  get buildPath() {
    return this.config.buildPath;
  }

  createOutput() {
    return {
      path: this.buildPath,
      publicPath: this.publicPath
    };
  }

  initCreate() {
    if (this.outerConfig.create) {
      this.outerConfig.create.bind(this)();
    }
    if (this.type) {
      const onName = `on${this.type.replace(/^\S/, m => m.toUpperCase())}`;
      if (this.outerConfig[onName] && this.utils.isFunction(this.outerConfig[onName])) {
        this.outerConfig[onName].apply(this);
      }
    }
  }

  setStartCreateQueue(fn, args) {
    this.startCreateQueue.push({ fn, args });
  }

  setBeforeCreateQueue(fn, args) {
    this.beforeCreateQueue.push({ fn, args });
  }

  setCreateQueue(fn, args) {
    this.setBeforeCreateQueue(fn, args);
  }

  executeCreateQueue(queue) {
    queue.forEach(q => {
      if (q.args) {
        const args = this.utils.isFunction(q.args) ? q.args.apply(this) : q.args;
        q.fn.apply(this, [args]);
      } else {
        q.fn.apply(this);
      }
    });
  }

  combineWebpackConfig() {
    this.t3 = Date.now();
    const configWebpackConfig = this.mergeWebpackConfig(this.webpackConfig, this.outerWebpackConfig);
    const buildWebpackConfig = {
      output: this.createOutput(),
      module: {
        rules: this.createWebpackLoader()
      },
      plugins: this.createWebpackPlugin()
    };
    const webpackConfig = this.mergeWebpackConfig(configWebpackConfig, buildWebpackConfig);
    this.t4 = Date.now();
    this.logger.cost();
    return webpackConfig;
  }

  create() {
    this.t2 = Date.now();
    this.setAlias(this.config.alias);
    this.initCreate();
    this.executeCreateQueue(this.startCreateQueue);
    this.createEntry();
    this.createFileOption();
    this.executeCreateQueue(this.beforeCreateQueue);
    // this.checkCreate();
    return this.combineWebpackConfig();
  }

  createWebpackConfig() {
    return this.create();
  }

  checkCreate() {
    assert(this.config.buildPath, 'webpack output path not set, please call setBuildPath method set');
    assert(this.config.publicPath, 'webpack output publicPath not set, please call setPublicPath method set');
    /* istanbul ignore next */
    assert(this.config.entry || this.webpackConfig.entry, 'webpack entry is empty, please call setEntry or setHtml');
  }


  initStyleLoader(loader, options) {
    this.setStyleLoader(loader, options);
  }

  setStyleLoader(loader, options) {
    this.styleLoader = { loader, options };
  }

  createPostCssLoader(loaderOptions) {
    const options = this.merge(this.config.devtool ? { sourceMap: true } : {}, loaderOptions);
    return { loader: 'postcss-loader', options };
  }

  createDllPlugin(dll) {
    dll = dll || this.config.dll;
    const dllArray = WebpackBaseBuilder.getDllConfig(dll);
    dllArray.forEach(item => {
      if (item.name && item.lib) {
        const plugin = {};
        plugin[`${item.name}Dll`] = new this.webpack.DllPlugin({
          context: this.baseDir,
          path: WebpackBaseBuilder.getDllFilePath(item.name, this.env),
          name: '[name]'
        });
        this.addPlugin(plugin);
      }
    });
  }

  createDllReferencePlugin(dll) {
    dll = dll || this.config.dll;
    const dllArray = WebpackBaseBuilder.getDllConfig(dll);
    dllArray.forEach(item => {
      if (item.name && item.lib) {
        const plugin = {};
        const filename = WebpackBaseBuilder.getDllFilePath(item.name, this.env);
        if (fs.existsSync(filename)) {
          plugin[`${item.name}DllReference`] = new this.webpack.DllReferencePlugin({
            context: this.baseDir,
            manifest: require(filename)
          });
          this.addPlugin(plugin);
        }
      }
    });
  }
}

module.exports = WebpackBaseBuilder;
