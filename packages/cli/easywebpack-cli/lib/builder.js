'use strict';
const webpack = require('../lib/webpack');
const easy = require('../lib/easy');

exports.getFramework = (filepath = 'webpack.config.js', baseDir) => {
  return easy.getFramework(filepath, baseDir);
};

exports.getWebpackBuilder = (framework, baseDir) => {
  return easy.getWebpackBuilder(framework, baseDir);
};

exports.install = options => {
  easy.install(options);
};

exports.getEasy = cfg => {
  return easy.getEasy(cfg);
};

exports.getWebpackConfig = cfg => {
  if (cfg.cli.webpack) {
    return webpack.getWebpackConfig(cfg);
  }
  return easy.getWebpackConfig(cfg);
};

exports.build = cfg => {
  if (cfg.cli.webpack) {
    return webpack.build(cfg);
  }
  return easy.build(cfg);
};

exports.server = cfg => {
  if (cfg.cli.webpack) {
    return webpack.server(cfg);
  }
  return easy.server(cfg);
};
