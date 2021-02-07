'use strict';
const path = require('path');
const fs = require('fs');
const merge = require('webpack-merge');
const easywebpack = require('@easy-team/easywebpack-vue');

exports.getVesWebpackFileConfig = baseDir => {
  const filepath = path.resolve(baseDir, 'config/ves.config.js');
  if (fs.existsSync(filepath)) {
    return require(filepath);
  }
  return {};
};

exports.getVesConfig = (options = {}) => {
  const { baseDir = process.cwd() } = options;
  const baseConfig = {
    baseDir,
    framework: 'vue',
    configured: true,
    egg: true,
    output: {
      path: path.join(baseDir, 'app/public')
    },
    module: {
      rules: [
        {
          ts: true
        }, 
        {
          scss: true
        },
        {
          stylus: true
        },
        {
          less: true
        }
      ]
    },
    plugins:[]
  };
  const config = exports.getVesWebpackFileConfig(baseDir);
  const assetpath = path.resolve(baseDir, 'app/web/asset');
  if (fs.existsSync(assetpath)) {
    baseConfig.plugins.push({
      copy: [{
        from: 'app/web/asset',
        to: 'asset'
      }]
    });
  }
  return merge(baseConfig, config, options);
};

exports.getWebpackConfig = (options = {}) => {
  const vesConfig = exports.getVesConfig(options);
  return easywebpack.getWebpackConfig(vesConfig);
};