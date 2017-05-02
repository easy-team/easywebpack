'use strict';
const Utils = require('../utils/utils');
const WebpackBase = require('../lib/base');

class ConfigBase extends WebpackBase {
  constructor(config) {
    super(config);
    if (!this.config.isServer) {
      this.config.extract = true;
    }
    this.useHash(true);
  }

  useHash(isHash, len = 7) {
    if (isHash) {
      this.filename = Utils.assetsPath(this.config, `js/[name].[hash:${len}].js`);
      this.chunkFilename = Utils.assetsPath(this.config, `js/[id].[chunkhash:${len}].js`);
      this.imageName = Utils.assetsPath(this.config, `img/[name].[hash:${len}].[ext]`);
      this.cssName = Utils.assetsPath(this.config, `css/[name].[contenthash:${len}].css`);
    } else {
      this.filename = Utils.assetsPath(this.config, 'js/[name].js');
      this.chunkFilename = Utils.assetsPath(this.config, 'js/[id].js');
      this.imageName = Utils.assetsPath(this.config, `img/[name].[ext]`);
      this.cssName = Utils.assetsPath(this.config, 'css/[name].css')
    }
  }
}
module.exports = ConfigBase;
