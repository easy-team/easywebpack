exports.defaultConfig = {
  baseDir: process.cwd(),
  buildPath: 'public',
  publicPath: '/public/',
  prefix: '',
  alias: {},
  packs: {},
  cdn: {},
  hot: false,
  hash: true,
  cssExtract: true,
  cssModule: true,
  miniJs: true,
  miniCss: true,
  miniImage: true,
  plugin: {
    provide: {},
    define: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production') }
  }
};

exports.devConfig = {
  hot: true,
  hash: false,
  miniJs: false,
  miniCss: false,
  miniImage: false,
  cssExtract: false,
  plugin: {
    define: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development') }
  }
};

exports.testConfig = {
  hot: false,
  hash: true,
  miniJs: false,
  miniCss: false,
  miniImage: false
};