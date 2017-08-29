'use strict';
const expect = require('chai').expect;
const webpack = require('webpack');
const merge = require('webpack-merge');
const WebpackBaseBuilder = require('../lib/base');
const Loader = require('../utils/loader');
const path = require('path').posix;
// http://chaijs.com/api/bdd/
function createBuilder() {
  const builder = new WebpackBaseBuilder();
  builder.setBuildPath(path.join(__dirname, 'test'));
  builder.setPublicPath('/public');
  builder.setEntry({
    include: path.join(__dirname, 'test')
  });
  return builder;
}

describe('loader.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#webpack loader update test', () => {
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

  describe('#webpack loader delete test', () => {
    const imageLoader = {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'url-loader',
      query: {
        limit: 2048
      }
    };
    const builder = createBuilder();
    expect(builder.findLoaderIndex(imageLoader) > -1);

    builder.deleteLoader(imageLoader);
    expect(builder.findLoaderIndex(imageLoader) === -1);

    builder.addLoader(imageLoader);
    expect(builder.findLoaderIndex(imageLoader) > -1);
    builder.deleteLoader('url-loader');
    expect(builder.findLoaderIndex(imageLoader) === -1);

    builder.addLoader(imageLoader);
    expect(builder.findLoaderIndex(imageLoader) > -1);
    builder.deleteLoader({loader: 'url-loader'}, 'loader');
    expect(builder.findLoaderIndex(imageLoader) === -1);

    builder.addLoader(imageLoader);
    expect(builder.findLoaderIndex(imageLoader) > -1);
    builder.deleteLoader({test: /\.(png|jpe?g|gif|svg)(\?.*)?$/}, 'test');
    expect(builder.findLoaderIndex(imageLoader) === -1);

    expect(builder.deleteLoader({test: /\.(png|jpe?g|gif|svg)(\?.*)?$/}) === null );
  });

  describe('#webpack loader find test', () => {

  });

  describe('#webpack loader add test', () => {

    const imageLoader = {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'url-loader',
      query: {
        limit: 2048
      }
    };

    const fontLoader = {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'url-loader',
      query: {
        limit: 2048
      }
    };

    it('should addLoader#test_loader_replace_and_update', () => {
      const builder = createBuilder();
      builder.setConfig({
        loaderOption: {
          imageUrl: { query: { limit: 2048 } }
        }
      });
      const loaderIndex = builder.findLoaderIndex(imageLoader);
      expect(loaderIndex > -1);
      expect(builder.configLoader[loaderIndex].fn().query.limit).to.equal(2048);
    });

    it('should addLoader#test_same_loader_name_add', () => {
      const builder = createBuilder();
      builder.addLoader(imageLoader);
      builder.addLoader(fontLoader);
      const imageLoaderIndex = builder.findLoaderIndex(imageLoader, 'all');
      const fontLoaderIndex = builder.findLoaderIndex(fontLoader, 'all');

      expect(imageLoaderIndex > -1);
      expect(builder.configLoader[imageLoaderIndex].test.toString()).to.equal(imageLoader.test.toString());

      expect(fontLoaderIndex > -1);
      expect(builder.configLoader[fontLoaderIndex].test.toString()).to.equal(fontLoader.test.toString());
    });

    it('should addLoader#test_loader_option_function', () => {
      const builder = createBuilder();
      builder.addLoader(fontLoader, null, null, null, 'replace');
      builder.addLoader(fontLoader.test, fontLoader.loader, () => merge({ query: fontLoader.query }, { query: { name: 'font-url-loader' } }), null, 'replace');

      const urlLoaders = () => builder.configLoader.filter(item => item.test.toString() === fontLoader.test.toString());
      expect(urlLoaders().length).to.equal(1);

      const fontLoaderIndex = builder.findLoaderIndex(fontLoader, 'all');
      const expectLoader = builder.configLoader[fontLoaderIndex];

      expect(expectLoader).to.have.property('fn');
      expect(expectLoader.fn().query.limit).to.equal(2048);
      expect(expectLoader.fn().query.name).to.equal('font-url-loader');
    });
  });
});
