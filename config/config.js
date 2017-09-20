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
  options: {
    resolve: {
      extensions: ['.js', '.jsx']
    },
    resolveLoader: {
      modules: [
        path.join(baseDir, 'node_modules'),
        path.join(__dirname, '../node_modules')
      ]
    }
  },
  loaders: {},
  plugins: {
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
  cssExtract: true,
  plugins: {
    define: {
      args: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
      }
    }
  }
};

exports.prodConfig = {
  hot: false,
  hash: true,
  miniJs: true,
  miniCss: true,
  miniImage: true,
  cssExtract: true,
  loaders: {
    css: {
      options: {
        minimize: true
      }
    }
  },
  plugins: {
    define: {
      args: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
      }
    }
  }
};