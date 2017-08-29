'use strict';
const merge = require('webpack-merge');
const Utils = require('../utils/utils');
const Loader = require('../utils/loader');
class WebpackLoader {
  initLoader() {
    this.addLoader(/\.jsx?$/, 'babel-loader', () => {
      return {
        options: {
          //presets: [require('babel-preset-env')],
          //plugins: [
          //  require('babel-plugin-syntax-dynamic-import'),
          //  require('babel-plugin-transform-object-rest-spread'),
          //  require('babel-plugin-transform-async-to-generator'),
          //  require('babel-plugin-transform-regenerator'),
          //  require('babel-plugin-add-module-exports')]
        }
      };
    }, { exclude: /node_modules/ });
    this.addLoader(/\.(png|jpe?g|gif|svg)(\?.*)?$/, 'url-loader', () => {
      return merge({
        query: {
          limit: 1024,
          name: this.config.imageName
        }
      }, this.config.loaderOption.imageUrl);
    });
    this.addLoader(/\.(woff2?|eot|ttf|otf)(\?.*)?$/, 'url-loader', () => {
      return merge({
        query: {
          limit: 1024,
          name: this.config.frontName
        }
      }, this.config.loaderOption.fontUrl);
    });
  }

  addLoader(test, loader, option, ex, action = 'append') {
    option = Utils.isFunction(option) ? { fn: option } : option;
    if (Utils.isObject(test) && test.hasOwnProperty('test')) {
      loader = merge(test, option, ex);
    } else {
      // loader = Utils.isString(loader) && /-loader$/.test(loader) ? require.resolve(loader) : loader;
      loader = merge({ test, loader }, option, ex);
    }
    if (action === 'append' || !action) {
      this.configLoader = this.configLoader.concat(loader);
    } else {
      const loaderIndex = this.findLoaderIndex(loader);
      if (loaderIndex > -1) {
        if (action === 'replace') {
          this.configLoader[loaderIndex] = loader;
        } else if (action === 'merge') {
          const loaderInfo = this.configLoader[loaderIndex];
          if (loader.test && loaderInfo.test && loader.loader && loaderInfo.loader && loader.test.toString() === loaderInfo.test.toString()) {
            const mergeLoader = merge({}, loaderInfo);
            delete mergeLoader.loader;
            if (!mergeLoader.use) {
              mergeLoader.use = [{ loader: loaderInfo.loader, options: loaderInfo.options || loaderInfo.query }];
            }
            if (loader.use) {
              mergeLoader.use = mergeLoader.use.concat(loader.use);
            } else {
              mergeLoader.use.push({ loader: loader.loader, options: loader.options || loader.query });
            }
            this.configLoader[loaderIndex] = mergeLoader;

          } else {
            this.configLoader[loaderIndex] = merge(loaderInfo, loader);
          }
        } else {
          this.configLoader = this.configLoader.concat(loader);
        }
      }
    }
  }

  findLoaderIndex(loader, match = 'all') {
    return this.configLoader.findIndex(item => {
      if (Utils.isString(loader)) {
        return item.loader && require.resolve(loader) === require.resolve(item.loader);
      }

      if ((match === 'all' || !match) && loader.test && item.test && loader.loader && item.loader) {
        if (loader.test.toString() === item.test.toString() && require.resolve(loader.loader) === require.resolve(item.loader)) {
          return true;
        }
      }

      if ((match === 'test' || !match) && loader.test && item.test && loader.test.toString() === item.test.toString()) {
        return true;
      }

      if ((match === 'loader' || !match) && loader.loader && item.loader && require.resolve(loader.loader) === require.resolve(item.loader)) {
        return true;
      }

      return false;
    });
  }

  updateLoader(loader, match) {
    const loaderIndex = this.findLoaderIndex(loader, match);
    if (loaderIndex > -1) {
      this.configLoader[loaderIndex] = merge(this.configLoader[loaderIndex], loader);
      return this.configLoader[loaderIndex];
    }
    return null;
  }

  deleteLoader(loader, match) {
    const loaderIndex = this.findLoaderIndex(loader, match);
    if (loaderIndex > -1) {
      return this.configLoader.splice(loaderIndex, 1);
    }
    return null;
  }

  createWebpackLoader() {
    const webpackLoaders = [];
    const styleConfig = this.getStyleConfig();
    Loader.styleLoaders(styleConfig).forEach(loader => {
      this.configLoader.push(loader);
    });
    this.configLoader.forEach(loader => {
      if (loader.fn && Utils.isFunction(loader.fn)) {
        const tempLoader = Object.assign({}, loader);
        const loaderConfig = tempLoader.fn();
        delete tempLoader.fn;
        webpackLoaders.push(merge(tempLoader, loaderConfig));
      } else {
        webpackLoaders.push(loader);
      }
    });
    return webpackLoaders;
  }
}

module.exports = WebpackLoader;