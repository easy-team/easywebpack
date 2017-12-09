'use strict';
const path = require('path');
const baseDir = process.cwd();
module.exports = {
  context: baseDir,
  output:{},
  resolve: {
    extensions: ['.js']
  },
  resolveLoader: {
    modules: [
      path.join(baseDir, 'node_modules'),
      path.join(__dirname, '../node_modules')
    ]
  }
};