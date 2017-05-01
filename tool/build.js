'use strict';
const path = require('path');
const webpack = require('webpack');

module.exports = (buildConfig, callback) => {
  const webpackBuildConfig = Array.isArray(buildConfig) ? buildConfig : [buildConfig];
  webpack(webpackBuildConfig, (err, compilation) => {
    if (err) {
      throw err;
    }
    const stats = compilation.stats || [compilation];
    stats.forEach(stat => {
      process.stdout.write(stat.toString({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false,
        }) + '\n');
    });
    callback && callback();
  });
};
