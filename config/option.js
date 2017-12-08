'use strict';
const path = require('path');
const baseDir = process.cwd();
module.exports = {
  context: baseDir,
  resolve: {
    extensions: ['.js', '.jsx']
  },
  resolveLoader: {
    modules: [
      path.join(baseDir, 'node_modules'),
      path.join(__dirname, '../node_modules')
    ]
  }
};