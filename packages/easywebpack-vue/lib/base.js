'use strict';
const path = require('path');
const WebpackBaseBuilder = WebpackBuilder => class extends WebpackBuilder {
  constructor(config) {
    super(config);
    this.mergeConfig(require('../config/config'));
    this.mergeLoader(require('../config/loader'));
    this.mergePlugin(require('../config/plugin'));
    this.setExtensions('.vue');
    this.setResolveLoader({ modules: [path.join(__dirname, '../node_modules')] });
  }

  prepareEntry(entries) {
    return super.prepareEntry(entries, { loader: 'vue-entry-loader', match: '.vue' });
  }
};
module.exports = WebpackBaseBuilder;
