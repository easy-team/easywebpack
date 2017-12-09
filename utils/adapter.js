'use strict';
const path = require('path');
const utils = require('./utils');
const defaultPlugin = require('../config/plugin');

const manifest = {
  enable: false,
  type: 'client',
  name: 'webpack-manifest-resource-plugin',
  args() {
    const args = {
      baseDir: this.baseDir,
      proxy: this.proxy,
      host: this.host,
      buildPath: this.buildPath,
      assets: false,
      writeToFileEmit: true
    };
    const dllConfig = this.config.dll;
    const plugins = this.config.plugins || {};
    const manifest = plugins.manifestDeps || plugins.manifest || {};
    const filepath = path.join(this.baseDir, manifest.fileName || 'config/manifest.json') ;
    // 如果开启了dll 功能, 则读取 dll manifest 配置, 然后与项目 manifest 合并
    if (dllConfig) {
      return this.merge(args, { filepath, dllConfig, dllDir: utils.getCompileTempDir() });
    }
    return this.merge(args, { filepath, commonsChunk: this.getCommonsChunk() });
  }
};

exports.normalizePlugin = (config) => {
  const plugin = utils.cloneDeep(defaultPlugin);
  if (config.plugins && config.plugins.manifestDeps) {
    plugin.manifest = manifest;
    return plugin;
  } else if (config.framework === 'vue') {
    const version = utils.getVersion('egg-view-vue-ssr', config.baseDir);
    // 版本3 只能用 manifest
    if(version && /^3/.test(version)){
      plugin.manifest = manifest;
      delete plugin.buildfile;
    }
  } else if (config.framework === 'react') {
    const version = utils.getVersion('egg-view-react-ssr', config.baseDir);
    // 版本2 只能用 新 manifest
    if(version && /^2/.test(version)){
      plugin.manifest = manifest;
      delete plugin.buildfile;
    }
  }
  return plugin;
};