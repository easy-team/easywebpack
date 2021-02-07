'use strict';
const WebpackBaseBuilder = require('./base');
const { dll } = require('../../config/config');
const babelrc = require('../../config/babel.web');
class WebpackDllBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.type = WebpackDllBuilder.TYPE;
    this.setBabelrc(babelrc);
    this.setTarget(WebpackDllBuilder.TARGET);
    this.mergeConfig(dll);
    this.setBuildPath(this.utils.getDllCompileFileDir(this.env), true);
    this.setLibrary('[name]');
    this.setStartCreateQueue(this.setBabelENV);
    this.setCreateQueue(this.createDllPlugin);
  }

  get dll() {
    return true;
  }

  createEntry(config) {
    const dllArray = WebpackDllBuilder.getDllConfig(config.dll);
    dllArray.forEach(item => {
      this.addEntry(item.name, item.lib);
    });
  }

  createOptimization() {
    return this.webpackOptimize.getDLLOptimization();
  }
}
WebpackDllBuilder.TYPE = 'client';
WebpackDllBuilder.TARGET = 'web';
module.exports = WebpackDllBuilder;
