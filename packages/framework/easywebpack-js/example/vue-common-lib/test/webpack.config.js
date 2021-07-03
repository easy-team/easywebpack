'use strict';
const path = require('path');
const resolve = filepath => path.resolve(__dirname, filepath);

module.exports = {
  framework: 'vue',
  entry: {
    app: 'src/app.js'
  },
  externals: {
    'vue': 'VueLib.default.Vue',
    'vuex': 'VueLib.default.Vuex',
    'vue-router': 'VueLib.default.VueRouter'
  },
  plugins: [
    {
      copy: [{
        from: resolve('../dist'),
        to: resolve('dist')
      }]
    }
  ]
}