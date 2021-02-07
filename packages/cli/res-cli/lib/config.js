'use strict';
const path = require('path');
const fs = require('fs');
const merge = require('webpack-merge');
const easywebpack = require('@easy-team/easywebpack-react');

exports.getResWebpackFileConfig = baseDir => {
  const filepath = path.resolve(baseDir, 'config/res.config.js');
  if (fs.existsSync(filepath)) {
    return require(filepath);
  }
  return {};
};

exports.getResConfig = (options = {}) => {
  const { baseDir = process.cwd(), env } = options;
  const baseConfig = {
    baseDir,
    framework: 'react',
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
    }
  };
  const resConfig = exports.getResWebpackFileConfig(baseDir);
  return merge(baseConfig, resConfig, options);
};

exports.getWebpackConfig = (options = {}) => {
  const config = exports.getResConfig(options);
  return easywebpack.getWebpackConfig(config);
};