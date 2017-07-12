const merge = require('webpack-merge');
const defaultConfig = {
  baseDir: process.cwd(),
  prefix: '',
  buildPath: 'public',
  publicPath: '/public/',
  alias: {},
  packs: {},
  cdn: {},
  manifest: true,
  buildConfig: true,
  hot: false,
  hash: true,
  miniJs: true,
  miniCss: true,
  miniImage: true
};

module.exports = (env, config) => {
  const isDev = (env === 'local' || env === 'dev');
  const devConfig = {
    miniJs: false,
    miniCss: false,
    miniImage: false
  };
  if (isDev) {
    return merge(defaultConfig, { hot: true, hash: false }, devConfig, config);
  }
  if (env === 'test') {
    return merge(defaultConfig, { hot: false }, devConfig, config);
  }
  return merge(defaultConfig, config);
};