'use strict';
const path = require('path');
const fs = require('fs');
const utils = require('./utils');
const g = require('lodash.get');

const manifest = {
  enable: true,
  type: 'client',
  name: 'webpack-manifest-resource-plugin',
  args() {
    const args = {
      baseDir: this.baseDir,
      host: this.host,
      proxy: this.config.proxy,
      buildPath: this.buildPath,
      publicPath: this.publicPath,
      localPublicPath: this.config.publicPath,
      assets: false,
      writeToFileEmit: true
    };
    const plugins = this.config.plugins || {};
    const manifestConfig = plugins.manifest || {};
    const filepath = path.join(this.baseDir, manifestConfig.fileName || 'config/manifest.json');
    // 兼容旧 manifest 配置
    const fileName = path.relative(this.config.buildPath, filepath);
    const dllConfig = utils.getDllConfig(this.config.dll);
    // 如果开启了dll 功能, 则读取 dll manifest 配置, 然后与项目 manifest 合并
    if (dllConfig) {
      return this.merge(args, {
        filepath,
        fileName,
        commonsChunk: this.getCommonsChunk(),
        dllConfig,
        dllDir: utils.getCompileTempDir(this.env)
      });
    }
    return this.merge(args, {
      filepath,
      fileName,
      commonsChunk: this.getCommonsChunk()
    });
  }
};

module.exports = class WebpackAdapter {
  constructor(builder) {
    this.builder = builder;
    this.baseDir = builder.baseDir;
  }

  adapterManifestPlugin(plugins = {}, config) {
    if (config.buildDll) {
      return plugins;
    }
    if (plugins && plugins.manifestDeps || config.dll) {
      plugins.manifest = manifest;
      plugins.buildfile = false;
    } else if (config.framework === 'vue') {
      const version = utils.getVersion('egg-view-vue-ssr', config.baseDir);
      // 版本3 只能用 manifest
      if (version && /^3/.test(version)) {
        plugins.manifest = manifest;
        plugins.buildfile = false;
      }
    } else if (config.framework === 'react') {
      const version = utils.getVersion('egg-view-react-ssr', config.baseDir);
      // 版本2 只能用 新 manifest
      if (version && /^2/.test(version)) {
        plugins.manifest = manifest;
        plugins.buildfile = false;
      }
    }
    return plugins;
  }
  adapterLoader(loaders = {}, config, outerConfig) {
    const configLoaders = outerConfig.loaders;
    if (utils.isObject(configLoaders)) {
      // 默认 typescript 开启, tslint 开启，eslint 禁用
      if (configLoaders.typescript) {
        if (utils.isObject(loaders.eslint) && configLoaders.eslint === undefined) {
          this.builder.mergeLoader({ eslint: false });
        }
        if (utils.isObject(loaders.tslint) && configLoaders.tslint === undefined) {
          this.builder.mergeLoader({ tslint: true });
        }
        // egg project, auto set client typescript tsconfig.json config
        const tsConfigFile = g(outerConfig, 'typescript.options.configFile');
        if (outerConfig.egg && !tsConfigFile) {
          const configFile = path.join(this.baseDir, './app/web/tsconfig.json');
          if (fs.existsSync(configFile)) {
            this.builder.mergeLoader({
              typescript: {
                options: {
                  configFile
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

  adapterPlugin(plugins = {}, config, outerConfig) {
    return this.builder.plugins;
  }
};