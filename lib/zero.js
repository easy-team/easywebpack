exports.init = function(config) {
  if (!config.entry) {
    if (this.egg) {
      // 设置默认 entry
      if (config.framework === 'vue') {
        config.entry = 'app/web/page/*/*.vue';
      } else if (config.framework === 'react') {
        config.entry = 'app/web/page/*/*.jsx';
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
}