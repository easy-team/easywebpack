'use strict';
const path = require('path');
const fs = require('fs');
const WebpackBaseBuilder = require('./base');

class WebpackClientBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.type = WebpackClientBuilder.TYPE;
    this.setProxy(config.egg);
    this.setDevTool(config.devtool);
    this.setPack(config.packs);
    this.setTarget(WebpackClientBuilder.TARGET);
    this.setCreateQueue(this.createDllReferencePlugin);
    this.setCreateQueue(this.createHotEntry);
    this.setCreateQueue(this.createHTML);
  }
}
WebpackClientBuilder.TYPE = 'client';
WebpackClientBuilder.TARGET = 'web';
module.exports = WebpackClientBuilder;