'use strict';
const path = require('path');
const baseDir = process.cwd();
module.exports = {
  context: baseDir,
  entry: {},
  output:{},
  resolve: {
    extensions: ['.js']
  },
  externals:[],
  resolveLoader: {
    modules: [
      path.join(baseDir, 'node_modules'),
      path.join(__dirname, '../node_modules')
    ]
  }
};