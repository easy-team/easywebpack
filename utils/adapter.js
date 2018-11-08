'use strict';
const path = require('path');
const fs = require('fs');
const utils = require('./utils');
const g = require('lodash.get');

module.exports = class WebpackAdapter {
  constructor(builder) {
    this.builder = builder;
    this.baseDir = builder.baseDir;
  }

  adapterLoader(loaders = {}, config) {
    const configLoaders = config.loaders;
    if (utils.isObject(configLoaders)) {
      // 默认 typescript 开启, tslint 开启，eslint 禁用
      if (this.builder.typescript) {
        if (utils.isObject(loaders.eslint) && configLoaders.eslint === undefined) {
          this.builder.mergeLoader({ eslint: false });
        }
        if (utils.isObject(loaders.tslint) && configLoaders.tslint === undefined) {
          this.builder.mergeLoader({ tslint: true });
        }
        // egg project, auto set client typescript tsconfig.json config
        const tsConfigFile = g(config, 'typescript.options.configFile');
        if (this.builder.egg && !tsConfigFile) {
          const configFile = path.join(this.baseDir, './app/web/tsconfig.json');
          if (fs.existsSync(configFile)) {
            this.builder.mergeConfig({
              loaderOptions: {
                ts: {
                  options: {
                    configFile
                  }
                }
              }
            });
          }
        }
        this.builder.setExtensions(['.ts'], false);
      }
    }
    return this.builder.loaders;
  }

  adapterPlugin(plugins = {}, config) {
    return this.builder.plugins;
  }
};