'use strict';
const Utils = require('../utils/utils');
const merge = require('webpack-merge');
class ConfigBase {
  constructor(config) {
    this.PROD = process.env.NODE_ENV === 'production';
    this.config = config;
    this.setImageCssHash(this.PROD)
  }

  setImageCssHash(isHash, len = 7) {
    if (isHash) {
      this.imageName = Utils.assetsPath(this.config, `img/[name].[hash:${len}].[ext]`);
      this.cssName = Utils.assetsPath(this.config, `css/[name].[contenthash:${len}].css`);
    } else {
      this.imageName = Utils.assetsPath(this.config, `img/[name].[ext]`);
      this.cssName = Utils.assetsPath(this.config, 'css/[name].css')
    }
  }
}
module.exports = ConfigBase;
