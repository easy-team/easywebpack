'use strict';
const pkg = require('./package.json');
const version = pkg.version;
const SCRIPT_TAG = process.env.SCRIPT_TAG;
module.exports = {
  framework: 'js',
  entry: {
    [`react-core-lib-${version}.${SCRIPT_TAG}`]: 'lib/react-core.js',
  },
  output: {
    library: 'ReactCoreLib'
  },
  plugins: [
    {
      clean: false
    }
  ]
};
