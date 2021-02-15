module.exports = {
  buildPath: 'dist',
  hot: false,
  hash: false,
  loaders:{
    scss: false,
    sass: false,
    less: false,
    stylus: false
  },
  plugins: {
    manifest: false,
    manifestDeps: false,
    commonsChunk: false
  }
};