'use strict';
const EasyWebpack = require('easywebpack');
exports.EasyWebpack = EasyWebpack;
Object.assign(exports, EasyWebpack);
exports.WebpackClientBuilder = require('./lib/client');
exports.getWebpackConfig = (config, option) => {
  return EasyWebpack.WebpackBuilder.getWebpackConfig(config, [exports.WebpackClientBuilder], option);
};
