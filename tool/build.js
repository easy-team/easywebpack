'use strict';
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
module.exports = (buildConfig, options, callback) => {
  const webpackBuildConfig = Array.isArray(buildConfig) ? buildConfig : [buildConfig];
  webpack(webpackBuildConfig, (err, compilation) => {
    if (err) {
      throw err;
    }
    const stats = compilation.stats || [compilation];
    stats.forEach(stat => {
      process.stdout.write(stat.toString(merge({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false,
        }, options && options.stat)) + '\n');
    });
    callback && callback();
  });
};
