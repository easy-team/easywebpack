'use strict';
const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {

  getConfigLoader(config) {
    const { loaders = {} } = config;
    const { rules = [] } = config.module || {};
    return { loaders, rules };
  },

  getConfigLoaderByName(name) {
    const { loaders, rules } = this.getConfigLoader(this.config);
    if (loaders[name]) {
      return loaders[name];
    }
    return rules.find(loader => {
      const label = this.utils.getLoaderLabel(loader);
      if (name === label) {
        return true;
      }
      return false;
    });
  },

  getLoaderByName(name) {
    const defaultLoader = this.utils.cloneDeep(this.loaders[name]);
    const configLoader = this.getConfigLoaderByName(this.config);
    return this.mergeLoader({ [name]: defaultLoader }, { [name]: configLoader })[name];
  },


  createPostCssLoader(loaderOptions) {
    const loader = 'postcss-loader';
    let options = this.merge(this.webpackConfig.devtool ? { sourceMap: true } : {}, loaderOptions);
    const postcssFile = path.join(this.baseDir, 'postcss.config.js');
    if (!fs.existsSync(postcssFile)) {
      const config = { path: path.resolve(__dirname, '../config/') };
      options = this.merge(options, { ident: 'postcss', config });
    }
    return { loader, options };
  },

  createBabelLoader(babel = {}) {
    babel = this.merge({ loader: 'babel-loader', options: {}}, babel);
    const babelEnv = process.env.BABEL_ENV;
    if (babelEnv) {
      if (this.isBabel7) { // @babel/core use envName key
        babel.options.envName = babelEnv;
      } else { // babel-core use forceEnv key
        babel.options.forceEnv = babelEnv;
      }
    }
    const compile = this.config.compile || {};
    // use babel cache
    if (compile.cache) {
      const cacheOptions = this.utils.isBoolean(compile.cache) ? {} : compile.cache;
      const cacheDirectory = this.utils.getCacheLoaderInfoPath(babel.loader, this.env, this.type);
      babel.options = this.merge(babel.options, { cacheDirectory }, cacheOptions);
    }
    // use project .babelrc
    if (fs.existsSync(this.projectBabelrc)) {
      return babel;
    }
    // use default babelrc
    babel.options = this.merge(babel.options, this.babelConfig);
    return babel;
  },

  createCacheLoader(loaderOptions, name) {
    const loader = name || 'cache-loader';
    const cacheDirectory = this.utils.getCacheLoaderInfoPath(loader, this.env, this.type);
    const options = this.utils.isObject(loaderOptions) ? this.merge({ cacheDirectory }, loaderOptions) : { cacheDirectory };
    return { loader, options };
  },

  createThreadLoader(loaderOptions) {
    const loader = 'thread-loader';
    const options = this.utils.isObject(loaderOptions) ? this.merge({ workers: 2 }, loaderOptions) : {};
    return { loader, options };
  },

  getCssLoaderOptions() {
    const itemLoader = this.getLoaderByName('css');
    if (itemLoader && itemLoader.use) {
      const cssLoader = itemLoader.use.find(loader => {
        return this.utils.isObject(loader) && loader.loader === 'css-loader';
      });
      return cssLoader && cssLoader.options;
    }
    return null;
  },

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
  },

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
        } else if (this.utils.isObject(sourceLoader) && !this.hasRuleKey(sourceLoader)) {
          delete sourceLoader.enable;
          target[name] = this.merge(target[name], { options: sourceLoader });
        } else {
          target[name] = this.merge(target[name], sourceLoader);
        }
      } else {
        target[name] = sourceLoaders[name];
      }
    });
    return target;
  },


  prepareCssModuleLoader(loaders) {},

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
          itemLoader.use.unshift(MiniCssExtractPlugin.loader);
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
  },

  createLoader(loaders) {
    const webpackLoaders = [];
    const loaderNames = Object.keys(loaders).filter(name => {
      return name !== 'options' && name !== 'entry'; // except loaders.options, this `options` property is global loader options key
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
  },

  installLoader(loaders) {
    const dependencies = this.dependencies;
    const webpackLoaders = this.createLoader(loaders);
    this.utils.installLoader(webpackLoaders, dependencies, this.modules, this.config.install);
    return webpackLoaders;
  },

  adapterTSLoader(loaders) {
    // 默认 typescript 开启, tslint 开启，eslint 禁用
    if (this.typescript) {
      this.setExtensions(['.ts'], false);
      // egg project, auto set client typescript tsconfig.json config
      if (this.egg) {
        const configFile = path.join(this.baseDir, './app/web/tsconfig.json');
        if (fs.existsSync(configFile)) {
          this.mergeLoader({
            ts: {
              options: {
                configFile
              }
            }
          });
        }
      }
    }
  },

  adapterLoader(loaders) {
    this.adapterTSLoader(loaders);
  },

  createWebpackLoader(config) {
    const { loaders, rules } = this.getConfigLoader(config);
    this.mergeLoader(rules);
    this.mergeLoader(loaders);
    this.adapterLoader(this.loaders);
    this.prepareCssModuleLoader(this.loaders);
    this.prepareLoaderOption(this.loaders, this.merge(config.loaderOptions, this.loaders.options));
    return this.installLoader(this.loaders);
  }
};