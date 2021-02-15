'use strict';
module.exports = {
  presets: [
    '@babel/preset-react',
    ['@babel/preset-env', {
      modules: false,
      // 'debug': true,
      useBuiltIns: false
    }]
  ]
};
