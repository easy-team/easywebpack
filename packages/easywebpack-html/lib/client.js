'use strict';
const path = require('path');
const EasyWebpack = require('easywebpack');
const merge = EasyWebpack.merge;
class WebpackClientBuilder extends EasyWebpack.WebpackClientBuilder {
  constructor(config) {
    super(config);
    this.setResolveLoader({ modules: [path.join(__dirname, '../node_modules')] });
    this.mergeConfig(require('../config/config'));
    this.mergeLoader(require('../config/loader'));
  }
}
module.exports = WebpackClientBuilder;