'use strict';
const pkg = require('./package.json');
const version = pkg.version;
const SCRIPT_TAG = process.env.SCRIPT_TAG;
module.exports = {
  framework: 'js',
  entry: {
    [`vue-lib-${version}.${SCRIPT_TAG}`] : 'lib/vue-lib.js',
  },
  output: {
    library: 'VueLib'
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js' 
    }
  },
  plugins:[
    {
      clean: false
    }
  ]
}