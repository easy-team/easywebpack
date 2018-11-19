'use strict';
const WebpackBaseBuilder = require('./base');
const { dll } = require('../../config/config');
class WebpackDllBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.type = WebpackDllBuilder.TYPE;
    this.setTarget(WebpackDllBuilder.TARGET);
    this.mergeConfig(dll);
    this.setBuildPath(this.utils.getDllCompileFileDir(this.env), true);
    this.setDevTool(config.devtool);
    this.setDllEntry(config.dll);
    this.setLibrary('[name]');
    this.setStartCreateQueue(this.setBabelENV);
    this.setCreateQueue(this.createDllPlugin);
  }

  get dll() {
    return true;
  }

  setDllEntry(configDll) {
    const dllArray = WebpackDllBuilder.getDllConfig(configDll);
    dllArray.forEach(item => {
      this.addEntry(item.name, item.lib);
    });
  }
}
WebpackDllBuilder.TYPE = 'client';
WebpackDllBuilder.TARGET = 'web';
module.exports = WebpackDllBuilder;
