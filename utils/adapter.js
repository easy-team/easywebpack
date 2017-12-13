'use strict';
const path = require('path');
const utils = require('./utils');

const manifest = {
  enable: true,
  type: 'client',
  name: 'webpack-manifest-resource-plugin',
  args() {
    const args = {
      baseDir: this.baseDir,
      host: this.host,
      proxy: this.config.proxy,
      buildPath: this.config.buildPath,
      assets: false,
      writeToFileEmit: true
    };
    const dllConfig = this.config.dll;
    const plugins = this.config.plugins || {};
    const manifest = plugins.manifest || {};
    const filepath = path.join(this.baseDir, manifest.fileName || 'config/manifest.json') ;
    // 兼容旧 manifest 配置
    const fileName = path.relative(this.config.buildPath, filepath);

    // 如果开启了dll 功能, 则读取 dll manifest 配置, 然后与项目 manifest 合并
    if (dllConfig) {
      return this.merge(args, { filepath, fileName, commonsChunk: this.getCommonsChunk(), dllConfig, dllDir: utils.getCompileTempDir() });
    }
    return this.merge(args, { filepath, fileName, commonsChunk: this.getCommonsChunk() });
  }
};

exports.normalizeManifestPlugin = (plugins, config) => {
  if (plugins && plugins.manifestDeps) {
    plugins.manifest = manifest;
    plugins.buildfile = false;
  } else if (config.framework === 'vue') {
    const version = utils.getVersion('egg-view-vue-ssr', config.baseDir);
    // 版本3 只能用 manifest
    if(version && /^3/.test(version)){
      plugins.manifest = manifest;
      plugins.buildfile = false;
    }
  } else if (config.framework === 'react') {
    const version = utils.getVersion('egg-view-react-ssr', config.baseDir);
    // 版本2 只能用 新 manifest
    if(version && /^2/.test(version)){
      plugins.manifest = manifest;
      plugins.buildfile = false;
    }
  }
  return plugins;
};