const production = process.env.NODE_ENV === 'production';
module.exports = {
  baseDir: process.cwd(),
  prod: process.env.NODE_ENV === 'production',
  prefix: '',
  buildPath: 'public',
  publicPath: '/public/',
  alias: {},
  packs: {},
  hot: production,
  hash: production,
  miniJs: production,
  miniCss: production,
  miniImage: production
};