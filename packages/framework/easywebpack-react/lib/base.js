'use strict';
const path = require('path');
const WebpackReactBaseBuilder = WebpackBuilder => class extends WebpackBuilder {
  constructor(config = {}) {
    super(config);
    this.mergeConfig(require('../config/config'));
    this.mergePlugin(require('../config/plugin'));
    this.setResolveLoader({
      modules: [path.resolve(__dirname, '../node_modules')]
    });
    this.setBabelrc(path.resolve(__dirname, '../config/.babelrc'));
    this.setExtensions('.jsx', false);
    if (this.typescript) {
      this.setExtensions('.tsx', false);
    }
  }

  prepareCssModuleLoader(loaders) {
    const cssModule = this.config.cssModule;
    const cssLoaderName = 'css-loader';
    Object.keys(loaders).forEach(name => {
      const itemLoader = loaders[name];
      if (Array.isArray(itemLoader.use)) {
        const cssLoaderIndex = itemLoader.use.findIndex(loader => {
          return loader === cssLoaderName || (this.utils.isObject(loader) && loader.loader === cssLoaderName);
        });
        if (cssLoaderIndex > -1) {
          const cssModuleLoader = this.utils.cloneDeep(itemLoader);
          const cssModuleName = `${name}_module`;
          const cssModuleLoaderOption = this.merge({
            options: {
              modules: true,
              importLoaders: cssModuleLoader.use.length - cssLoaderIndex
            }
          }, this.utils.isObject(cssModule) && cssModule.options);
          const oldCssLoader = cssModuleLoader.use[cssLoaderIndex];
          const newCssLoader = this.merge(this.utils.isString(oldCssLoader) ? { loader: cssLoaderName } : oldCssLoader, cssModuleLoaderOption);
          cssModuleLoader.use[cssLoaderIndex] = newCssLoader;
          if (this.ssr) {
            cssModuleLoader.use.unshift('isomorphic-style-loader');
          }
          // config.cssModule 模式
          if (cssModule) {
            if (this.utils.isObject(cssModule) && cssModule.include) {
              const include = [].concat(cssModule.include).map(filepath => {
                return this.utils.normalizePath(filepath, this.config.baseDir);
              });
              cssModuleLoader.include = [].concat(itemLoader.include || []).concat(include);
              itemLoader.exclude = [].concat(itemLoader.exclude || []).concat(include);
            } else if (this.utils.isBoolean(cssModule)) {
              itemLoader.enable = false;
            }
          } else { 
            // not fix: https://github.com/webpack-contrib/mini-css-extract-plugin/issues/126
            // /\.module\.scss/ 模式 
            const test = cssModuleLoader.test;
            const testStr = test instanceof RegExp ? test.toString() : test;
            //  /\.scss/ to /\.module\.scss/
            const cssModuleTest = testStr.replace('/\\.', '\\.module\\.').replace(/\/$/, '');
            const cssModuleTestRegex = new RegExp(cssModuleTest);
            cssModuleLoader.test = cssModuleTestRegex;
            cssModuleLoader.include = [cssModuleTestRegex];
            itemLoader.exclude = [cssModuleTestRegex];
          }
          loaders[cssModuleName] = cssModuleLoader;
        }
      }
    });
  }

  prepareEntry(entries) {
    return super.prepareEntry(entries, { loader: 'react-entry-template-loader', match: '.jsx' });
  }
};
module.exports = WebpackReactBaseBuilder;