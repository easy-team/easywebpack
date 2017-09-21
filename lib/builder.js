'use strict';
const path = require('path');

exports.getWebpackConfig = (config, builders) => {
  const baseDir = process.cwd();
  if (!config) {
    config = require(path.join(baseDir, 'webpack.config.js'));
  } else if (typeof config === 'string') {
    config = path.isAbsolute(config) ? config : require(path.join(baseDir, config));
  }
  const type = config.type;
  const webpackConfig = [];
  builders.forEach(builder => {
    const WebpackBuilder = builder;
    const webpackBuilder = new WebpackBuilder(config);
    if (type === undefined || type === webpackBuilder.type ||
      (Array.isArray(type) && type.includes(webpackBuilder.type))) {
      webpackConfig.push(webpackBuilder.create());
    }
  });
  return webpackConfig;
};
