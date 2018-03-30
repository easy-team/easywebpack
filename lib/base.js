'use strict';
const STYLE_LOADER = 'style-loader';
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const chalk = require('chalk');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AssetFileWebpackPlugin = require('webpack-asset-file-plugin');

const Config = require('./config');
class WebpackBaseBuilder extends Config {
  constructor(config = {}) {
    super(config);
    this.setStyleLoader(STYLE_LOADER);
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
  removePlugin(label) {
    delete this.plugins[label];
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

  getDLLChunk() {
    const dir = this.utils.getDllCompileFileDir(this.env);
    const dll = this.utils.getDllConfig(this.config.dll);
    const chunks = [];
    const names = [];
    dll.forEach(item => {
      const name = item.name;
      const manifestFile = this.utils.getDllManifestPath(item.name, this.env);
      if (fs.existsSync(manifestFile)) {
        const manifest = require(manifestFile);
        Object.keys(manifest).forEach(id => {
          const outputPath = manifest[id];
          const outputName = outputPath.replace(this.publicPath, '');
          const filepath = path.join(dir, outputName);
          const chunk = {
            id, // vendor.js
            name, // vendor
            outputName, // js/vendor.js
            outputPath, // public/js/vendor.js
            filepath // ${baseDir}/js/vendor.js
          };
          chunks.push(chunk);
        });
      }
      names.push(name);
    });
    return { names, chunks, dll };
  }

  getCommonsChunk(useRuntime = true) {
    let commonsChunks = [];
    if (useRuntime) {
      const runtime = this.getPluginByName('runtime');
      if (runtime && runtime.enable) {
        if (runtime.args) {
          commonsChunks = commonsChunks.concat(runtime.args.names || runtime.args.name || []);
        }
      }
    }
    const common = this.getPluginByName('commonsChunk');
    if (common && common.enable) {
      if (common.args) {
        commonsChunks = commonsChunks.concat(common.args.names || common.args.name || []);
      }
    }
    return commonsChunks;
  }


  createFileOption(config) {
    this.createFileName(config);
    this.createImageName(config);
    this.createCssName(config);
    this.createMediaName(config);
    this.createFrontName(config);
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
        itemLoader.use.forEach((loader, index) => {
          const label = this.utils.getLoaderLabel(loader);
          const mLabel = this.loaderKeyLabelMapping[name];
          const configOptions = itemLoader.options && (label === mLabel || label === name) ? itemLoader.options : {};
          const options = this.merge(loaderOptions[label], { options: configOptions });
          if (this.utils.isString(loader)) {
            itemLoader.use.splice(index, 1, this.merge({ loader }, options));
          } else if (this.utils.isObject(loader) && this.utils.isString(loader.loader)) {
            itemLoader.use[index] = this.merge(itemLoader.use[index], options);
          }
        });
        if (itemLoader.postcss) {
          const postcssIndex = ['css', 'css_module'].includes(name) ? itemLoader.use.length : itemLoader.use.length - 1;
          const postcssLoader = this.createPostCssLoader(loaderOptions && loaderOptions.postcss);
          itemLoader.use.splice(postcssIndex, 0, postcssLoader);
        }
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
    const webpackLoaders = this.createLoader(loaders);
    this.utils.installLoader(webpackLoaders, dependencies, this.modules, this.config.install);
    return webpackLoaders;
  }

  adapterLoader(loaders) {
    this.adapter.adapterLoader(loaders, this.config);
  }

  createWebpackLoader(config) {
    this.mergeLoader(config.loaders);
    this.adapterLoader(this.loaders);
    this.prepareCssModuleLoader(this.loaders);
    this.prepareLoaderOption(this.loaders, this.merge(this.config.loaderOptions, this.loaders.options));
    return this.installLoader(this.loaders);
  }

  createPlugin(plugins) {
    const webpackPlugins = [];
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
            Clazz = this.utils.requireModule(configInfo.name, this.modules);
          } else if (this.utils.isFunction(configInfo.name)) {
            pluginName = configInfo.name.name;
          }
          assert(Clazz, chalk.red(`dynamic create plugin[${name}] error, please check the npm module [${pluginName}] whether installed. ${chalk.yellow('if not installed, please execute below command in command line:')}\r\n
            ${chalk.green('npm')}: easy install --mode npm | npx easy install --mode npm\r\n
            ${chalk.green('cnpm')}: easy install --mode cnpm | npx easy install --mode cnpm\r\n
            ${chalk.green('tnpm')}: easy install --mode tnpm | npx easy install --mode tnpm\r\n
            ${chalk.green('yarn')}: easy install --mode yarn | npx easy install --mode yarn\r\n
            ${chalk.yellow('or')} \r\n
            ${chalk.green('npm')}: npm install ${pluginName} --save-dev\r\n
            ${chalk.green('cnpm')}: cnpm install ${pluginName} --save-dev\r\n
            ${chalk.green('tnpm')}: tnpm install ${pluginName} --save-dev\r\n
            ${chalk.green('yarn')}: yarn install ${pluginName} --save-dev\r\n`
          ));
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
    const dependencies = this.dependencies;
    const enablePlugins = {};
    Object.keys(plugins).forEach(name => {
      const pluginInfo = plugins[name];
      if (this.isUse(pluginInfo)) {
        enablePlugins[name] = pluginInfo;
      }
    });
    return this.utils.installPlugin(enablePlugins, dependencies, this.modules, this.config.install);
  }

  adapterPlugin(plugins) {
    this.adapter.adapterPlugin(plugins, this.config);
  }

  createWebpackPlugin(config) {
    this.mergePlugin(config.plugins);
    this.installPlugin(this.plugins);
    this.adapterPlugin(this.plugins);
    return this.createPlugin(this.plugins);
  }

  createEntry(config) {
    const entry = this.utils.getEntry(config, this.type);
    this.setWebpackConfig({ entry });
  }

  createOutput(config) {
    return {
      path: this.buildPath,
      publicPath: this.publicPath
    };
  }

  initCreate(config) {
    if (config.create) {
      config.create.bind(this)();
    }
    if (this.type) {
      const onName = `on${this.type.replace(/^\S/, m => m.toUpperCase())}`;
      if (config[onName] && this.utils.isFunction(config[onName])) {
        config[onName].apply(this);
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

  combineWebpackConfig(config) {
    this.t3 = Date.now();
    const buildWebpackConfig = {
      output: this.createOutput(config),
      module: {
        rules: this.createWebpackLoader(config)
      },
      plugins: this.createWebpackPlugin(config)
    };
    const webpackConfig = this.mergeWebpackConfig(this.nativeWebpackConfig, buildWebpackConfig);
    this.t4 = Date.now();
    this.logger.cost();
    return webpackConfig;
  }

  create() {
    this.t2 = Date.now();
    const config = this.config;
    this.setAlias(config.alias);
    this.initCreate(config);
    this.executeCreateQueue(this.startCreateQueue);
    this.createEntry(config);
    this.createFileOption(config);
    this.executeCreateQueue(this.beforeCreateQueue);
    return this.combineWebpackConfig(config);
  }

  createWebpackConfig() {
    return this.create();
  }

  checkCreate(config) {
    assert(config.buildPath, 'webpack output path not set, please call setBuildPath method set');
    assert(config.publicPath, 'webpack output publicPath not set, please call setPublicPath method set');
    /* istanbul ignore next */
    assert(config.entry || this.webpackConfig.entry, 'webpack entry is empty, please call setEntry or setHtml');
  }

  createPostCssLoader(loaderOptions) {
    const loader = 'postcss-loader';
    const options = this.merge(this.config.devtool ? { sourceMap: true } : {}, loaderOptions);
    return { loader, options };
  }

  createCacheLoader(loaderOptions, name) {
    const loader = name || 'cache-loader';
    const cacheDirectory = this.utils.getCacheLoaderInfoPath(loader, this.env, this.type);
    const options = this.utils.isObject(loaderOptions) ? this.merge({ cacheDirectory }, loaderOptions) : { cacheDirectory };
    return { loader, options };
  }

  createThreadLoader(loaderOptions) {
    const loader = 'thread-loader';
    const options = this.utils.isObject(loaderOptions) ? this.merge({ workers: 2 }, loaderOptions): {};
    return { loader, options };
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

  createDllAssetPlugin() {
    const dllChunk = this.getDLLChunk();
    if (dllChunk.chunks.length) {
      this.addPlugin({
        dllAsset: new AssetFileWebpackPlugin({
          assets: dllChunk.chunks
        })
      });
    }
  }
}

module.exports = WebpackBaseBuilder;