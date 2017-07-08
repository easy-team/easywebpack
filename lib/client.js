'use strict';
const path = require('path');
const Utils = require('../utils/utils');
const WebpackBaseBuilder = require('./base');

class WebpackClientBuilder extends WebpackBaseBuilder {
  constructor(baseDir) {
    super(baseDir);
    this.setPrefix('client');
  }

  createBuildConfig() {
    const filepath = path.join(this.baseDir, 'config/buildConfig.json');
    const buildConfig = {
      publicPath: this.publicPath,
      commonsChunk: this.commonsChunk
    };
    Utils.saveBuildConfig(filepath, buildConfig);
  }

  create() {
    this.createFileName();
    this.createImageName();
    this.createCssName();
    this.createCommonsChunkPlugin();
    this.createExtractTextPlugin(this.prod);
    this.createHotModuleReplacementPlugin(!this.prod);
    return super.create();
  }
}
module.exports = WebpackClientBuilder;
