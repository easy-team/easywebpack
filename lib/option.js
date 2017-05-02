'use strict';
const merge = require('webpack-merge');
const WebpackBase = require('./base');
class WebpackOption extends WebpackBase {
  constructor(config) {
    super(config);
    this.options = {};
  }

  setOption(options) {
    this.options = merge(this.options, options);
  }

  setEntry(entry) {
    this.options = merge(this.options, { entry });
  }

  setOutput(options) {
    this.options = merge(this.options, options);
  }

  setExtensions(extensions) {
    this.options = merge(this.options, { resolve: { extensions } });
  }

  getOpiton() {
    return this.options;
  }
}

module.exports = WebpackOption;
