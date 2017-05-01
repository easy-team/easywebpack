'use strict';
const Utils = require('../utils/utils');

class ConfigBase {
  constructor(config) {
    this.env = process.env.BUILD_ENV;
    this.isServer = !!process.env.BUILD_SERVER;
    this.config = config;
    this.useHash(true);
  }

  useHash(isHash, len = 7) {
    if (isHash) {
      this.filename = Utils.assetsPath(this.config, `js/[name].[hash:${len}].js`);
      this.chunkFilename = Utils.assetsPath(this.config, `js/[id].[hash:${len}].js`);
      this.imageName = Utils.assetsPath(this.config, `img/[name].[hash:${len}].[ext]`);
      this.cssName = Utils.assetsPath(this.config, `css/[name].[hash:${len}].css`);
    } else {
      this.filename = Utils.assetsPath(this.config, 'js/[name].js');
      this.chunkFilename = Utils.assetsPath(this.config, 'js/[id].js');
      this.imageName = Utils.assetsPath(this.config, `img/[name].[ext]`);
      this.cssName = Utils.assetsPath(this.config, 'css/[name].css')
    }
  }
}
module.exports = ConfigBase;
