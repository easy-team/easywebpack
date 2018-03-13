'use strict';
const expect = require('chai').expect;
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const merge = WebpackTool.merge;
const WebpackBaseBuilder = require('../lib/base');
const path = require('path').posix;

// http://chaijs.com/api/bdd/
function createBuilder(config) {
  const builder = new WebpackBaseBuilder(config);
  builder.setBuildPath('dist/base');
  builder.setPublicPath('/public');
  builder.setEntry({
    include: __dirname
  });
  return builder;
}

describe('base.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#webpack options test', () => {
    it('should setOption', () => {
      const builder = createBuilder();

      builder.setWebpackConfig({
        resolve: {
          extensions: ['.vue']
        },
        output: {
          path: __dirname,
          publicPath: __dirname
        }
      });
      expect(builder.webpackConfig.output.path).to.equal(__dirname);
      expect(builder.webpackConfig.output.publicPath).to.equal(__dirname);
      expect(builder.webpackConfig.resolve.extensions).to.have.lengthOf(2);
    });

    it('should webpack alias test', () => {
      const builder = createBuilder();
      builder.setExternals({ $: 'window.jquery' });
      builder.setAlias('component', 'app/web/component');
      builder.setAlias('asset', 'app/web/asset', false);
      builder.setAlias({
        widget: 'app/web/widget'
      });
      builder.setDefine('process.env.system', 'web');

      const webpackConfig = builder.create();
      expect(builder.webpackConfig.resolve.alias).to.have.property('component');
      expect(builder.webpackConfig.resolve.alias).to.have.property('widget');
      expect(webpackConfig.resolve.alias).to.have.property('component');
      expect(webpackConfig.resolve.alias).to.have.property('widget');
      expect(webpackConfig.resolve.alias.component).to.equal('app/web/component');
      expect(webpackConfig.resolve.alias.asset).to.equal('app/web/asset');
    });
  });

  describe('#webpack public method test', () => {
    it('should setAlias', () => {
      const builder = createBuilder();

      builder.setAlias('vue', 'vue/dist/vue.common.js');
      expect(builder.webpackConfig.resolve.alias).to.have.property('vue');
      const webpackConfig = builder.create();
      expect(webpackConfig.resolve.alias).to.have.property('vue');
    });
    it('should setExtensions', () => {
      const builder = createBuilder();
      builder.setExtensions('.vue');
      builder.setExtensions(['.css', '.jsx']);
      expect(builder.webpackConfig.resolve.extensions).to.include.members(['.vue', '.css', '.jsx']);
      const webpackConfig = builder.create();
      expect(webpackConfig.resolve.extensions).to.include.members(['.vue', '.css', '.jsx']);
    });
  });

  describe('#webpack create test', () => {
    it('should create webpack config', () => {
      const builder = createBuilder();
      const webpackConfig = builder.create();
      expect(webpackConfig).to.include.all.keys('module', 'output', 'resolve', 'plugins');
      expect(webpackConfig.module.rules).to.be.an('array');
      expect(webpackConfig.resolve.extensions).to.be.an('array').that.includes('.js');
    });
  });

  describe('#webpack create test', () => {
    it('should create webpack config', () => {
      const builder = createBuilder({
        prefix: 'static'
      });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.filename).to.equal('static/js/[name].js');
      expect(webpackConfig.output.chunkFilename).to.equal('static/js/chunk/[name].js');
  });
});
});
