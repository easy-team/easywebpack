const production = process.env.NODE_ENV === 'production';
module.exports = {
  baseDir: process.cwd(),
  prod: production,
  prefix: '',
  buildPath: 'public',
  publicPath: '/public/',
  alias: {},
  packs: {},
  hot: !production,
  hash: production,
  miniJs: production,
  miniCss: production,
  miniImage: production,
  manifest: true,
  buildConfig: true,
  cdn: {}
};