module.exports = {
  framework: 'html',
  entry: 'src/**/*.js',
  devtool: 'source-map',
  template: 'view/layout.html',
  alias: {
    asset: 'asset',
    jquery: 'asset/js/jquery-3.2.1.min.js',
  },
  externals: {
    jquery: 'window.$',
  },
  module: {
    rules: [
      { scss: true },
      {
        nunjucks: {
          options: {
            searchPaths: ['./widget', './test'],
          },
        },
      },
    ],
  },
  plugins: [],
  done() {},
};
