'use strict';
const baseDir = process.cwd();

exports.base = {
  config: {
    baseDir,
    port:9000,
    buildPath: 'dist',
    publicPath: '/',
    hashLength: 8,
    alias: {},
    packs: {},
    cdn: {},
    install:{
      check: false
    },
    postcss: true,
    compile:{
      cache: true,
      thread: true
    },
    node: {
      console: false,
      Buffer: false,
      setImmediate: false
    }
  },
  loaders: {},
  plugins: {}
};

exports.dev = {
  config: {
    hash: false,
    cssExtract: false,
    node: {
      console: true
    }
  },
  plugins:[{
    hot: true,
  }]
};

exports.test = {
  config: {
    hash: true,
    cssExtract: true,
  },
  plugins:[{
    hot: false,
  }]
};

exports.prod = {
  config: {
    hash: true,
    cssExtract: true
  },
  loaders: {
    css: {
      options: {
        minimize: true
      }
    }
  },
  plugins:{
    hot: false,
  }
};

exports.dll = {
  config: {
    cssExtract: false,
  },
  loaders: {
    eslint: false,
    scss: false,
    sass: false,
    less: false,
    stylus: false
  },
  plugins: {
    html: false,
    runtime: false,
    commonsChunk: false,
    imagemini: false,
    manifest: false,
    manifestDll: true,
    tsChecker: false
  }
};