'use strict';
const EasyWebpack = require('easywebpack');
exports.EasyWebpack = EasyWebpack;
Object.assign(exports, EasyWebpack);
exports.WebpackClientBuilder = require('./lib/client');
exports.WebpackServerBuilder = require('./lib/server');

exports.getWebpackConfig = (config, option) => {
  return EasyWebpack.WebpackBuilder.getWebpackConfig(config, [exports.WebpackClientBuilder, exports.WebpackServerBuilder], option);
};

exports.getWebWebpackConfig = (config = {}, option = {}) => {
  return exports.WebpackBuilder.getWebpackConfig(config, [exports.WebpackClientBuilder], option);
};

exports.getNodeWebpackConfig = (config = {}, option = {}) => {
  return exports.WebpackBuilder.getWebpackConfig(config, [exports.WebpackServerBuilder], option);
};
