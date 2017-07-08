'use strict';
const expect = require('chai').expect;
const webpack = require('webpack');
const merge = require('webpack-merge');
const WebpackServerBuilder = require('../lib/server');
const Loader = require('../utils/loader');
const path = require('path');
// http://chaijs.com/api/bdd/
function createBuilder(){
  const builder = new WebpackServerBuilder();
  builder.setBuildPath(path.join(__dirname, 'test'));
  builder.setPublicPath('/public');
  builder.setEntry(path.join(__dirname, 'test'));
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

  describe('#webpack create test', () => {
    it('should create webpack config', () => {
      const builder = createBuilder();
      const webpackConfig = builder.create();
      expect(webpackConfig).to.include.all.keys('entry', 'module', 'output', 'resolve', 'plugins');
      expect(webpackConfig.module.rules).to.be.an('array');
      expect(webpackConfig.plugins).to.be.an('array');
      expect(webpackConfig.resolve.extensions).to.be.an('array').that.includes('.js');
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

      const newLoaderIndex = builder.findLoaderIndex('vue-loader');
      const newLoader = builder.loaders[newLoaderIndex];
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
