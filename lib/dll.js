'use strict';
const path = require('path');
const fs = require('fs');
const WebpackBaseBuilder = require('./base');
const merge = require('webpack-merge');
const Config = require('../config/config');
class WebpackDllBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(merge({ useHost: false }, config));
    this.type = WebpackDllBuilder.TYPE;
    this.mergeConfig(Config.dllConfig);
    this.setProxy(true);
    this.setDevTool(config.devtool);
    this.setTarget(WebpackDllBuilder.TARGET);
    this.setLibrary('[name]');
    this.setCreateQueue(this.createDllPlugin);
  }
}
WebpackDllBuilder.TYPE = 'client';
WebpackDllBuilder.TARGET = 'web';
module.exports = WebpackDllBuilder;