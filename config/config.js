'use strict';
const path = require('path').posix;
const baseDir = process.cwd();
exports.defaultConfig = {
  baseDir,
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
  options: {
    resolve: {
      extensions: ['.js', '.jsx']
    },
    resolveLoader: {
      modules: [
        path.join(__dirname, '../node_modules'),
        path.join(baseDir, 'node_modules'),
        'node_modules'
      ]
    }
  },
  loaders: {
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
  miniImage: false,
  plugins: {
    define: {
      args: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
      }
    }
  }
};