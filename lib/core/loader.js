'use strict';
const path = require('path');
const fs = require('fs');
const { STYLE_LOADER, CSS_LOADER } = require('../core/constant');

module.exports = {

  getLoaderLabel(loader) {
    return this.utils.getLoaderLabel(loader, this);
  },

  getLoaderIndex (loaders, name) {
    return loaders.findIndex(loader => name === (this.utils.isObject(loader) ? loader.loader : loader));
  },

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

    const mappingName = Object.keys(this.refactorLoaderMapping).find(tmpKey => {
      return this.refactorLoaderMapping[tmpKey] === name;
    });
    if (loaders[mappingName]) {
      return loaders[mappingName];
    }

    const rule = rules.find(loader => {
      if (loader.name && (loader.name === name || loader.name === mappingName)) {
        return true;
      }
      if (loader.hasOwnProperty(name) || loader.hasOwnProperty(mappingName)) {
        return true;
      }
      return false;
    });
    if (rule) {
      return rule && rule.name ? rule : rule[name] || rule[mappingName];
    }
    return undefined;
  },

  getMergeLoaderByName(name) {
    const defaultLoader = this.utils.cloneDeep(this.loaders[name]);
    const configLoader = this.getConfigLoaderByName(name);
    return this.mergeLoader({ [name]: configLoader }, { [name]: defaultLoader });
  },

  getLoaderByName(name) {
    const loader = this.getMergeLoaderByName(name);
    const loaders = this.mergeLoaderOption(loader, this.loaderOptions);
    const webpackLoaders = this.createLoader(loaders);
    if (webpackLoaders.length) {
      return webpackLoaders[0];
    }
    return {};
  },

  initLoader() {
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

  createTsLoader() {
    const loaders = [];
    const createTsLoader = options => {
      return { loader: 'ts-loader', options };
    };
    const compile = this.config.compile || {};
    if (compile.thread) {
      loaders.unshift(this.createThreadLoader(compile.thread));
      loaders.push(createTsLoader({ happyPackMode: true }));
    } else {
      loaders.push(createTsLoader());
    }
    if (compile.cache) {
      loaders.unshift(this.createCacheLoader(compile.cache));
    }
    // react typescript need to dynamic import
    if (this.typescript && this.framework === 'react') {
      loaders.unshift(this.createBabelLoader());
    }
    return loaders;
  },

  createPostCssLoader(loaderOptions) {
    const loader = 'postcss-loader';
    let options = this.merge(!this.ssr && this.webpackConfig.devtool ? { sourceMap: true } : {}, loaderOptions);
    const postcssFile = path.join(this.baseDir, 'postcss.config.js');
    if (!fs.existsSync(postcssFile)) {
      const config = { path: path.resolve(__dirname, '../../config/') };
      options = this.merge(options, { ident: 'postcss', config });
    }
    return { loader, options };
  },

  createBabelLoader(babel = {}) {
    babel = this.merge({ loader: 'babel-loader', options: {} }, babel);
    const babelEnv = this.babelEnv;
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
    if (this.projectBabelrc) {
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

  getTsLoader() {
    const itemLoader = this.getLoaderByName('ts');
    if (itemLoader && itemLoader.use) {
      const tsLoader = itemLoader.use.find(loader => {
        return this.utils.isObject(loader) && loader.loader === 'ts-loader';
      });
      return tsLoader;
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
        const label = this.getLoaderLabel(loader);
        if (this.isWebpackLoader(loader)) {
          sourceLoaders[label] = this.merge(loader, { enable: true });
        } else {
          sourceLoaders[label] = loader[label];
        }
      });
    }
    Object.keys(sourceLoaders).forEach(key => {
      const sourceLoader = sourceLoaders[key];
      if (this.utils.isObject(sourceLoader) && sourceLoader.loader) { // single loader config
        sourceLoader.use = [{ loader: sourceLoader.loader, options: sourceLoader.options || {} }];
      }
      const name = this.refactorLoaderMapping[key] || key;
      const loader = target[name];
      if (loader) {
        if (this.utils.isObject(sourceLoader) && sourceLoader.enable === undefined) {
          target[name].enable = true;
        }
        if (this.utils.isBoolean(sourceLoader)) {
          target[name].enable = sourceLoader;
        } else if (this.utils.isObject(sourceLoader) && sourceLoader.use) {
          target[name] = this.merge(target[name], sourceLoader);
          target[name].use = sourceLoader.use;
        } else if (this.utils.isObject(sourceLoader) && !this.hasRuleKey(sourceLoader)) {
          delete sourceLoader.enable;
          target[name] = this.merge(target[name], { options: sourceLoader });
        } else {
          target[name] = this.merge(target[name], sourceLoader);
        }
      } else {
        target[name] = sourceLoader;
      }
    });
    return target;
  },

  mergeLoaderOption(loaders, loaderOptions) {
    const extract = this.isUse('extract');
    Object.keys(loaders).forEach(name => {
      const itemLoader = loaders[name];
      if (this.utils.isFunction(itemLoader.use)) {
        itemLoader.use = itemLoader.use.apply(this);
      }
      if (Array.isArray(itemLoader.use)) {
        itemLoader.use.forEach((loader, index) => {
          const label = this.getLoaderLabel(loader);
          const mLabel = this.loaderKeyLabelMapping[name];
          const configOptions = itemLoader.options && (label === mLabel || label === name) ? itemLoader.options : {};
          const tmpLoaderOptions = loaderOptions[label] || {};
          if (tmpLoaderOptions.hasOwnProperty('include') || tmpLoaderOptions.hasOwnProperty('exclude')) {
            delete tmpLoaderOptions.include;
            delete tmpLoaderOptions.exclude;
          }
          const exOptions = tmpLoaderOptions.options ? tmpLoaderOptions : { options: tmpLoaderOptions };
          const options = this.utils.merge(exOptions, { options: configOptions });
          if (this.utils.isString(loader)) {
            itemLoader.use.splice(index, 1, this.utils.merge({ loader }, options));
          } else if (this.utils.isObject(loader) && this.utils.isString(loader.loader)) {
            itemLoader.use[index] = this.utils.merge(itemLoader.use[index], options);
          }
        });
       
        if (this.postcss && itemLoader.postcss) {
          const cssLoaderIndex = this.getLoaderIndex(itemLoader.use, CSS_LOADER);
          const styleLoaderIndex = this.getLoaderIndex(itemLoader.use, STYLE_LOADER);
          const postcssIndex = cssLoaderIndex > -1 ? cssLoaderIndex : styleLoaderIndex;
          if (postcssIndex > -1 ) {
            const postcssLoader = this.createPostCssLoader(loaderOptions && loaderOptions.postcss);
            itemLoader.use.splice(postcssIndex + 1, 0, postcssLoader);
          }
        }
        // replace style-loader
        if (itemLoader.framework && this.styleLoader && this.styleLoader.loader) {
          if (extract) {
            const miniCssPluginName = 'mini-css-extract-plugin';
            const miniCssPluginFile = path.join(this.baseDir, 'node_modules', miniCssPluginName);
            const MiniCssExtractPlugin = fs.existsSync(miniCssPluginFile) ? require(miniCssPluginFile) : require(miniCssPluginName);
            itemLoader.use.unshift(MiniCssExtractPlugin.loader);
          } else {
            const hasStyleLoader = itemLoader.use.find(loader => {
              return loader === this.styleLoader.loader || (this.utils.isObject(loader) && loader.loader === this.styleLoader.loader);
            });
            if (!hasStyleLoader) {
              const styleLoaderIndex = this.getLoaderIndex(itemLoader.use, STYLE_LOADER);
              if (styleLoaderIndex > -1) {
                itemLoader.use.splice(styleLoaderIndex, 1);
              }
              itemLoader.use.unshift(this.styleLoader);
            }
          }
        }
      }
    });
    return loaders;
  },

  prepareCssModuleLoader(loaders) {},

  prepareLoaderOption(loaders, loaderOptions) {
    return this.mergeLoaderOption(loaders, loaderOptions);
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
      ['type', 'enable', 'postcss', 'framework', 'loader', 'options', 'name'].forEach(propery => {
        delete itemLoader[propery];
      });
    });
    return webpackLoaders;
  },


  createFrameworkLoader(styleLoader = 'style-loader', options) {
    const preLoaders = {};
    const loaders = { js: this.createBabelLoader() }; // fix vue entry babel compile
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
    // https://github.com/TypeStrong/ts-loader/pull/782
    // vue-loader 14 版本中，需在 options 重复配置 ts-loader，升级 15 以后可移除
    if (this.typescript) {
      const tsLoader = this.getTsLoader();
      loaders.ts = tsLoader;
    }
    return { preLoaders, loaders };
  },

  installLoader(loaders) {
    const dependencies = this.dependencies;
    const webpackLoaders = this.createLoader(loaders);
    this.utils.installLoader(webpackLoaders, dependencies, this.modules, this.config.install);
    return webpackLoaders;
  },

  createWebpackLoader(config) {
    const { loaders, rules } = this.getConfigLoader(config);
    this.mergeLoader(loaders);
    this.mergeLoader(rules);
    this.prepareCssModuleLoader(this.loaders);
    this.prepareLoaderOption(this.loaders, this.loaderOptions);
    return this.installLoader(this.loaders);
  }
};