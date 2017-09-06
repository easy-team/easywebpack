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
  miniJs: true,
  miniCss: true,
  miniImage: true,
  cssExtract: true,
  loaders: {},
  loaderOptions: {
    css: {
      minimize: true
    }
  },
  plugins: {
    define: {
      args: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production') }
    },
    manifest: {}
  }
};

exports.devConfig = {
  hot: true,
  hash: false,
  miniJs: false,
  miniCss: false,
  miniImage: false,
  cssExtract: false,
  plugins: {
    define: {
      args: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
      }
    }
  }
};

exports.testConfig = {
  hot: false,
  hash: true,
  miniJs: false,
  miniCss: false,
  miniImage: false
};