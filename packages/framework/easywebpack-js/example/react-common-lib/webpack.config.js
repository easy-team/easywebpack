'use strict';
const pkg = require('./package.json');
const version = pkg.version;
const SCRIPT_TAG = process.env.SCRIPT_TAG;
module.exports = {
  framework: 'js',
  entry: {
    [`react-mobx-lib-${version}.${SCRIPT_TAG}`] : 'lib/react-mobx.js',
  },
  output: {
    library: 'ReactMobxLib'
  },
  plugins:[
    {
      clean: false
    }
  ]
}