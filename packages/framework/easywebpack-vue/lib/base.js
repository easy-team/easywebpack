'use strict';
const path = require('path');
const { isVue3 } = require('./utils');

const WebpackBaseBuilder = WebpackBuilder => class extends WebpackBuilder {
  constructor(config) {
    super(config);
    this.mergeConfig(require('../config/config'));
    this.mergeLoader(require('../config/loader'));
    this.mergePlugin(require('../config/plugin'));
    this.setExtensions('.vue');
    this.setResolveLoader({ modules: [path.join(__dirname, '../node_modules')] });
    this.createVueLoaderPlugin();
  }

  prepareEntry(entries) {
    return super.prepareEntry(entries, { loader: 'vue-entry-loader', match: '.vue' });
  }

  createVueLoaderPlugin() {
    if (isVue3(this.baseDir)) {
      const pluginModule = this.requireModule('vue-loader', this.modules);
      if (pluginModule) {
        const { VueLoaderPlugin } = pluginModule;
        if (VueLoaderPlugin) {
          this.addPlugin({ vueloader: { name: VueLoaderPlugin } });
        } else {
          this.addPlugin({ vueloader: { name: pluginModule } });
        }
      }
    } else {
      const VueLoaderPlugin = this.requireModule('vue-loader/lib/plugin.js', this.modules);
      this.addPlugin({ vueloader: { name: VueLoaderPlugin } });
    }
  }
};
module.exports = WebpackBaseBuilder;
