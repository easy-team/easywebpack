'use strict';
const POLYFILL = /polyfill/.test(process.env.SCRIPT_TAG);
const presetEnv = POLYFILL ? {
  modules: false,
  debug: true,
  useBuiltIns: 'usage',
  corejs: { version: 3, proposals: true },
  targets: {
    browsers: ['Android >= 4']
  }
} : {
  modules: false,
  debug: true,
  useBuiltIns: false
};
console.log('>>POLYFILL', POLYFILL);
module.exports = {
  presets: [
    ['@babel/preset-env', presetEnv]
  ]
}
