'use strict';
const WebpackBaseBuilder = require('./base');
const Config = require('../config/config');
class WebpackDllBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.type = WebpackDllBuilder.TYPE;
    this.setBabelENV('web');
    this.mergeConfig(Config.dllConfig);
    this.setBuildPath(this.utils.getDllCompileFileDir(this.env), true);
    this.setDevTool(config.devtool);
    this.setDllEntry(config.dll);
    this.setTarget(WebpackDllBuilder.TARGET);
    this.setLibrary('[name]');
    this.setCreateQueue(this.createDllPlugin);
  }

  get dll() {
    return true;
  }

  setDllEntry(dll) {
    const dllArray = WebpackDllBuilder.getDllConfig(dll);
    dllArray.forEach(item => {
      this.addEntry(item.name, item.lib);
    });
  }
}
WebpackDllBuilder.TYPE = 'client';
WebpackDllBuilder.TARGET = 'web';
module.exports = WebpackDllBuilder;
