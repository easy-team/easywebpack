'use strict';
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const chalk = require('chalk');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const Config = require('./config');
const adapter = require('../utils/adapter');
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
    this.initialize();
    this.initialized = true;
  }

  initEnv(config = {}) {
    this.env = config.env || 'dev'; // local/dev, test, prod
    this.dev = false;
    this.test = false;
    this.prod = false;
    const defaultConfig = require('../config/config');
    this.mergeConfig(defaultConfig.baseConfig, true);
    if (this.env === 'prod') {
      this.prod = true;
      this.mergeConfig(defaultConfig.prodConfig, true);
    } else if (this.env === 'test') {
      this.test = true;
      this.mergeConfig(defaultConfig.testConfig, true);
    } else {
      this.dev = true;
      this.mergeConfig(defaultConfig.devConfig, true);
    }
  }

  initialize(config, reset) {
    config = config || this.config;
    this.setPrefix(config.prefix);
    this.setAlias(config.alias);
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
    this.setHot(config.hot);
    this.setCDN(config.cdn.url, config.cdn.dynamicDir);
    if (this.dev) {
      this.setDevMode(config.port, config.proxy);
    }
  }


  setConfig(config) {
    this.mergeConfig(config);
  }

  setEnv(env) {
    this.initEnv({ env });
  }

  addLoader(loader) {
    if (loader.test && (loader.use || loader.loader )) {
      const loaderInfo = {};
      const loaderName = [loader.loader || ''];
      loader.use.forEach(item => {
        if (utils.isString(item)) {
          loaderName.push(item.replace('-loader', ''));
        } else if (utils.isObject(item) && utils.isString(item.loader)) {
          loaderName.push(item.loader.replace('-loader', ''));
        }
      });
      loaderInfo[loaderName.join('-')] = loader;
      this.mergeLoader(loaderInfo)
    } else {
      this.mergeLoader(loader);
    }
  }

  mergeConfig(config = {}) {
    Object.keys(config).forEach(key => {
      if (key === 'loaders') {
        this.mergeLoader(config.loaders);
      } else if (key === 'plugins') {
        this.mergePlugin(config.plugins);
      } else if (this.utils.isObject(config[key])) {
        this.baseConfig[key] = this.merge(this.baseConfig[key], config[key]);
      } else {
        this.baseConfig[key] = config[key];
      }
    });
  }

  mergeLoader(loaders = {}, target) {
    target = target || this.loaders;
    const sourceLoaders = this.utils.cloneDeep(loaders);
    Object.keys(sourceLoaders).forEach(name => {
      const sourceLoader = sourceLoaders[name];
      if (sourceLoader.loader) { // single loader config
        sourceLoader.use = [{ loader: sourceLoader.loader, options: sourceLoader.options || {} }];
      }
      const loader = target[name];
      if (loader) {
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
    const sourcePlugins = this.utils.cloneDeep(plugins);
    Object.keys(sourcePlugins).forEach(name => {
      const configPlugin = sourcePlugins[name];
      if (target[name]) {
        // enable function 优先级高
        if (!this.utils.isFunction(target[name].enable)) {
          // 如果配置了,表示开启插件
          if (this.utils.isObject(configPlugin) && configPlugin.enable === undefined) {
            target[name].enable = true;
          }
        }
        if (this.utils.isBoolean(configPlugin)) {
          target[name].enable = configPlugin;
        }
        else if (configPlugin.name || this.isWebpackPlugin(configPlugin)) { // 直接覆盖
          target[name] = configPlugin;
        } else {
          if (configPlugin.args) {
            if (target[name].concatArgs) {
              target[name].concatArgs = target[name].concatArgs.concat(target[name].args).concat(configPlugin.args);
            } else {
              target[name].concatArgs = [].concat(target[name].args).concat(configPlugin.args);
            }
          } else {
            // 如果 name 和 args 不存在, configPlugin直接作为args, 配置是可以省去 args key
            configPlugin.args = configPlugin;
          }
          const cloneConfigPlugin = this.utils.cloneDeep(configPlugin);
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

  isWebpackPlugin(plugin) {
    return this.utils.isObject(plugin) && plugin.constructor && plugin.constructor.prototype && plugin.constructor.prototype.apply;
  }

  isConfigPlugin(plugin) {
    return this.utils.isObject(plugin) && plugin.name;
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
          itemLoader.use.splice(postcssIndex, 0, 'postcss-loader');
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
          itemLoader.use.unshift(this.styleLoader);
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

  createWebpackLoader() {
    this.mergeLoader(this.configLoaders);
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
        // 如果直接是 new Plugin 方式
        if (this.isWebpackPlugin(configInfo)) {
          plugin = configInfo;
          pluginName = configInfo.constructor.name;
        }
        else if (this.utils.isObject(configInfo.name)) { // plugin object
          plugin = configInfo.name;
          pluginName = configInfo.constructor && configInfo.constructor.name;
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

  createWebpackPlugin() {
    this.mergePlugin(this.configPlugins);
    this.installPlugin(this.plugins);
    return this.createPlugin(this.plugins);
  }

  createEntry() {
    const entry = this.utils.getEntry(this.config, this.type);
    this.setWebpackConfig({ entry });
  }

  initCreate() {
    if (this.config.create) {
      this.config.create.bind(this)();
    }
    if (this.type) {
      const onName = `on${this.type.replace(/^\S/, m => m.toUpperCase())}`;
      if (this.config[onName] && this.utils.isFunction(this.config[onName])) {
        this.config[onName].apply(this);
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

  createWebpackConfig() {
    this.t3 = Date.now();
    const webpackConfig = this.merge(this.webpackConfig, {
      module: {
        rules: this.createWebpackLoader()
      },
      plugins: this.createWebpackPlugin()
    });
    this.t4 = Date.now();
    this.logger.cost();
    return webpackConfig;
  }

  create() {
    this.t2 = Date.now();
    this.initCreate();
    this.executeCreateQueue(this.startCreateQueue);
    this.createEntry();
    this.createFileOption();
    this.executeCreateQueue(this.beforeCreateQueue);
    this.checkCreate();
    return this.createWebpackConfig();
  }

  checkCreate() {
    assert(this.buildPath, 'webpack output path not set, please call setBuildPath method set');
    assert(this.publicPath, 'webpack output publicPath not set, please call setPublicPath method set');
    /* istanbul ignore next */
    assert(this.config.entry || this.options.entry, 'webpack entry is empty, please call setEntry or setHtml');
  }


  initStyleLoader(loader, options) {
    this.setStyleLoader(loader, options);
  }

  setStyleLoader(loader, options) {
    this.styleLoader = { loader, options };
  }

  createDllPlugin(dll) {
    dll = dll || this.config.dll;
    if (dll) {
      const dllArray = Array.isArray(dll) ? dll : [dll];
      dllArray.forEach(item => {
        if (item.name && item.lib) {
          const plugin = {};
          plugin[`${item.name}Dll`] = new this.webpack.DllPlugin({
            context: this.baseDir,
            path: this.utils.getDllFilePath(item.name),
            name: '[name]'
          });
          this.addPlugin(plugin);
        }
      });
    }
  }

  createDllReferencePlugin(dll) {
    dll = dll || this.config.dll;
    if (dll) {
      const dllArray = Array.isArray(dll) ? dll : [dll];
      dllArray.forEach(item => {
        if (item.name && item.lib) {
          const plugin = {};
          const filename = this.utils.getDllFilePath(item.name);
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

  createHotEntry() {
    const hot = this.getPluginByName('hot');
    if (this.isEnable(hot.enable)) {
      const hotMiddleware = require.resolve('webpack-hot-middleware').split(path.sep);
      hotMiddleware.pop();
      const defaultHotConfig = { noInfo: false, reload: false, quiet: false };
      const hot = this.utils.isObject(this.config.hot) ? this.merge(defaultHotConfig, this.config.hot) : defaultHotConfig;
      const hotInfo = [`${path.posix.join(hotMiddleware.join(path.sep))}/client?path=http://${this.utils.getIp()}:${this.config.port}/__webpack_hmr`];
      Object.keys(hot).forEach(key => {
        hotInfo.push(`${key}=${hot[key]}`);
      });
      const hotConfig = [hotInfo.join('&')];

      // open extract css hot reload
      if (this.config.hotCss) {
        hotConfig.push(require.resolve('../utils/hot'));
      }
      const packKeys = Object.keys(this.packs);
      const commonsChunk = this.getCommonsChunk();
      Object.keys(this.webpackConfig.entry).forEach(name => {
        if (!packKeys.includes(name) && !commonsChunk.includes(name)) {
          this.webpackConfig.entry[name] = hotConfig.concat(this.webpackConfig.entry[name]);
        }
      });
    }
  }

  createHTML() {
    if (this.config.entry && (this.config.entry.template || this.config.entry.html || this.config.framework === 'html')) {
      const pluginName = 'html';
      const plugin = this.getPluginByName(pluginName);
      if (this.isUse(plugin)) {
        let globalTemplate = this.config.entry.template;
        const config = this.utils.cloneDeep(this.config);
        if (this.utils.isObject(config.entry.html)) {
          globalTemplate = config.entry.html.template || globalTemplate;
          if (config.entry.html.include) {
            config.entry = Object.assign(config.entry, { include: null, exclude: null }, config.entry.html);
          }
        }
        globalTemplate = this.utils.normalizePath(globalTemplate, config.baseDir);
        const entry = this.utils.getEntry(config, this.type);
        const extMath = this.config.entry.extMatch || '.js';

        let deps;
        if (this.config.dll) {
          const manifest = this.getPluginByName('manifestDeps');
          const filepath = manifest && manifest.args && manifest.args.filepath;
          if (fs.existsSync(filepath)) {
            deps = require(filepath).deps;
          }
        }
        Object.keys(entry).forEach(entryName => {
          const entryFile = Array.isArray(entry[entryName]) ? entry[entryName].slice(-1)[0] : entry[entryName];
          const entryTemplate = entryFile.replace(extMath, config.templateExt || '.html');
          const template = fs.existsSync(entryTemplate) ? entryTemplate : globalTemplate;
          const htmlDir = config.entry.buildDir || config.prefix;
          const filename = htmlDir ? `${htmlDir}/${entryName}.html` : `${entryName}.html`;
          const resource = deps && deps[`${entryName}.js`] || {};
          const js = resource.js || [];
          const css = resource.css || [];
          const inject = js.length ? false : true;
          const minify = this.prod;
          const commonsChunk = inject ? this.getCommonsChunk() : [];
          const chunks = inject ? [].concat(commonsChunk).concat(entryName) : [entryName];
          if (!commonsChunk.includes(entryName)) {
            this.plugins[entryName] = this.merge(plugin, {
              args: {
                minify,
                inject,
                chunks,
                filename,
                template,
                css,
                js
              }
            });
          }
        });
        this.addEntry(entry);
      }
    }
    this.mergePlugin({ plugins: { html: false } }); // remove html single config
  }
}

module.exports = WebpackBaseBuilder;