'use strict';
const merge = require('webpack-merge');
const Loader = require('../utils/loader');
const ConfigBase = require('./base');

class ConfigLoader extends ConfigBase {
  constructor(config) {
    super(config);
    this.configLoaders = [
      {
        enable: true,
        client: true,
        server: true,
        env: ['dev', 'test', 'prod'],
        loader: {
          test: /\.(js)$/,
          loader: require.resolve('babel-loader'),
          exclude: /node_modules/
        }
      },
      {
        enable: true,
        client: true,
        server: true,
        env: ['dev', 'test', 'prod'],
        loader: {
          test: /\.json$/,
          loader: require.resolve('json-loader')
        }
      },
      {
        enable: true,
        client: true,
        server: true,
        env: ['dev', 'test', 'prod'],
        loader: {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: require.resolve('url-loader'),
          query: {
            limit: 1024,
            name: this.imageName
          }
        }
      }
    ];
    Loader.styleLoaders(this.config).forEach(loader => {
      this.configLoaders.push(merge({
        enable: true,
        client: true,
        server: true,
        env: ['dev', 'test', 'prod']
      }, { loader }));
    });
  }

  setLoaderEnable(name, enable) {
    this.getLoaderByName(name).forEach(item => {
      item.enable = enable;
    });
  }

  setLoaderClientEnable(name, enable) {
    this.getLoaderByName(name).forEach(item => {
      item.client = enable;
    });
  }

  setLoaderServerEnable(name, enable) {
    this.getLoaderByName(name).forEach(item => {
      item.server = enable;
    });
  }

  setLoaderEnv(name, env, options) {
    this.getLoaderByName(name).forEach(item => {
      if (options && options.replace) {
        item.env = Array.isArray(env) ? env : [env];
      } else if (Array.isArray(env)) {
        item.env = item.env.concat(env);
      } else {
        item.env.push(env);
      }
    });
  }

  updateLoader(name, loader) {
    this.getLoaderByName(name).forEach(item => {
      item.loader = merge(item.loader, loader);
    });
  }

  getLoaderByName(name) {
    return this.configLoaders.filter(rule => {
      return new RegExp(name, 'gi').test(rule.loader);
    });
  }

  getLoader() {
    return this.configLoaders.filter(loader => {
      return loader.enable && (this.config.isServer ? loader.server : loader.client) && loader.env.includes(this.env);
    }).map(item => {
      return item.loader;
    });
  }
}

module.exports = ConfigLoader;

