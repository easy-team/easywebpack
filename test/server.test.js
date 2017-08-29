'use strict';
const expect = require('chai').expect;
const webpack = require('webpack');
const merge = require('webpack-merge');
const WebpackServerBuilder = require('../lib/server');
const Loader = require('../utils/loader');
const path = require('path').posix;
// http://chaijs.com/api/bdd/
function createBuilder(config) {
  const builder = new WebpackServerBuilder(config);
  builder.setEntry({
    include: path.join(__dirname, '../test')
  });
  return builder;
}

describe('server.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#webpack base config test', () => {
    it('should server egg config', () => {
      const builder = createBuilder({ egg: true });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.path).to.equal(path.join(builder.config.baseDir, 'app/view'));
      expect(webpackConfig.output.publicPath).to.include('/public/client/');
    });
  });

  describe('#webpack create test', () => {
    it('should create webpack config', () => {
      const builder = createBuilder();
      const webpackConfig = builder.create();
      expect(webpackConfig).to.include.all.keys('module', 'output', 'resolve', 'plugins');
      expect(webpackConfig.module.rules).to.be.an('array');
      expect(webpackConfig.configPlugin).to.be.an('array');
      expect(webpackConfig.resolve.extensions).to.be.an('array').that.includes('.js');
    });
    it('should create ignoreCSS config', () => {
      const builder = createBuilder();
      builder.ignoreCSS();
      const webpackConfig = builder.create();
      expect(webpackConfig.configPlugin.some(p => {
        return p.constructor.name === 'IgnorePlugin';
      })).to.be.true;
    });

  });

  describe('#webpack loader change test', () => {
    it('should updateLoader', () => {
      const builder = createBuilder();

      builder.setStyleLoaderName('vue-style-loader');
      builder.addLoader(/\.vue$/, 'vue-loader', () => ({
        options: Loader.getStyleLoaderOption(builder.getStyleConfig())
      }));

      builder.updateLoader({
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerModules: [{
            postTransformNode: el => {
              el.staticStyle = `$processStyle(${el.staticStyle})`;
              el.styleBinding = `$processStyle(${el.styleBinding})`;
            }
          }]
        }
      });

      const updateLoader = builder.updateLoader({
        test: /\.vue1$/,
        loader: 'vue-loader'
      });

      expect(updateLoader === null);

      const newLoaderIndex = builder.findLoaderIndex('vue-loader', 'loader');
      const newLoader = builder.configLoader[newLoaderIndex];
      expect(typeof newLoader.fn === 'function').to.be.true;
      expect(newLoader.options).to.have.property('compilerModules');

      const webpackConfig = builder.create();
      const rules = webpackConfig.module.rules;
      const vueLoaderIndex = rules.findIndex(rule => rule.loader.includes('vue-loader'));
      const vueLoader = rules[vueLoaderIndex];
      expect(vueLoader.options).to.have.property('loaders');
      expect(vueLoader.options).to.have.property('compilerModules');
    });
  });

});
