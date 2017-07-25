exports.defaultConfig = {
  baseDir: process.cwd(),
  buildPath: 'public',
  publicPath: '/public/',
  prefix:'',
  alias: {},
  packs: {},
  cdn: {},
  manifest: true,
  buildConfig: true,
  hot: false,
  hash: true,
  miniJs: true,
  miniCss: true,
  miniImage: true,
  defines: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production') }
};

exports.devConfig = {
  hot: true,
  hash: false,
  miniJs: false,
  miniCss: false,
  miniImage: false,
  defines: { 'process.env.NODE_ENV': JSON.stringify('development') }
};

exports.testConfig = {
  hot: false,
  hash: true,
  miniJs: false,
  miniCss: false,
  miniImage: false
};