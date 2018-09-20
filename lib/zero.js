'use strict';
exports.init = function(config) {
  if (!config.entry) {
    if (this.egg) {
      // 设置默认 entry
      if (config.framework === 'vue') {
        config.entry = 'app/web/page/**(!components?|views?)/*.vue';
      } else if (config.framework === 'react') {
        config.entry = 'app/web/page/**(!components?|views?)/*.jsx';
      }
      // 设置默认 alias
      config.alias = this.merge({
        asset: 'app/web/asset',
        component: 'app/web/component',
        framework: 'app/web/framework',
        vue: 'vue/dist/vue.esm.js'
      }, config.alias);
    } else {
      config.entry = 'src/app.js';
    }
  }
  if (this.egg) {
    // 如果没有配置，Egg 应用构建路径默认为 public 和 /public/
    if (!config.buildPath) {
      config.buildPath = 'public';
    }
    if (!config.publicPath) {
      config.publicPath = '/public/';
    }
  }
};