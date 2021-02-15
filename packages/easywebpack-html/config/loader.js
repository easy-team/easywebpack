'use strict';
exports.nunjucks = {
  enable: false,
  test: /\.html$/,
  use: ['html-loader', {
    loader: 'nunjucks-html-loader',
    options: {
      searchPaths: []
    }
  }]
};