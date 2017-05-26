"use strict";
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const utils = require('../utils/utils');

module.exports = (buildConfig, options, callback) => {
  const webpackBuildConfig = Array.isArray(buildConfig) ? buildConfig : [buildConfig];

  const compiler = webpack(webpackBuildConfig, (err, compilation) => {
    if (err) {
      throw err;
    }
    const stats = compilation.stats || [compilation];

    stats.forEach(stat => {
      process.stdout.write(`${stat.toString(merge({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
      }, options && options.stat))}\n`);
    });
    const filepath = path.join(compiler.compilers[0].context, 'config/manifest.json');
    utils.normalizeManifestFile(filepath);
    callback && callback();
  });
};
