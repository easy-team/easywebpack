'use strict';
const path = require('path');
const resolve = filepath => path.resolve(__dirname, filepath);

module.exports = {
  framework: 'react',
  entry: {
    'react-mobx': 'src/react-mobx.js'
  },
  externals: {
    'react': 'ReactMobxLib.default.React',
    'react-dom': 'ReactMobxLib.default.ReactDOM',
    'mobx': 'ReactMobxLib.default.MobX',
    'mobx-react': 'ReactMobxLib.default.ReactMobX'
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