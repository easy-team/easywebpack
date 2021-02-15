module.exports = {
  cssExtract: true,
  hotCss: true,
  module: {
    rules: [
      { scss: false },
      { sass: false },
      { less: false },
      { stylus: false }
    ]
  },
  plugins: [
    { manifest: false}
  ]
};