'use strict';
const expect = require('chai').expect;
const webpack = require('webpack');
const merge = require('webpack-merge');
const WebpackBaseBuilder = require('../lib/base');
const Loader = require('../utils/loader');
const path = require('path');
// http://chaijs.com/api/bdd/
function createBuilder(){
  const builder = new WebpackBaseBuilder();
  builder.setBuildPath(path.join(__dirname, 'test'));
  builder.setPublicPath('/public');
  builder.setEntry({
    entry:{
      include: path.join(__dirname, 'test')
    }
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

      const optionPluginCount = builder.options.plugins && builder.options.plugins.length || 1;

      builder.setOption({
        resolve: {
          extensions: ['.vue', '.jsx']
        },
        output: {
          path: __dirname,
          publicPath: __dirname
        },
        plugins: [
          new webpack.DefinePlugin({
            'process.env.VUE_ENV': 'server'
          })
        ]
      });
      expect(builder.options.output.path).to.equal(__dirname);
      expect(builder.options.output.publicPath).to.equal(__dirname);
      expect(builder.options.resolve.extensions).to.have.lengthOf(3);
      expect(builder.options.plugins).to.have.lengthOf(optionPluginCount);
    });
  });

  describe('#webpack public method test', () => {
    it('should setAlias', () => {
      const builder = createBuilder();

      builder.setAlias('vue', 'vue/dist/vue.common.js');
      expect(builder.options.resolve.alias).to.have.property('vue');
      const webpackConfig = builder.create();
      expect(webpackConfig.resolve.alias).to.have.property('vue');
    });
    it('should setExtensions', () => {
      const builder = createBuilder();
      builder.setExtensions('.vue');
      builder.setExtensions(['.css', '.jsx']);
      expect(builder.options.resolve.extensions).to.include.members(['.vue', '.css', '.jsx']);
      const webpackConfig = builder.create();
      expect(webpackConfig.resolve.extensions).to.include.members(['.vue', '.css', '.jsx']);
    });
  });

  describe('#webpack loader test', () => {
    const test = /\.(woff2?|eot|ttf|otf)(\?.*)?$/;
    const loader = 'url-loader';
    const option = {
      query: {
        limit: 1024
      }
    };

    it('should addLoader#test_loader_option', () => {
      const builder = createBuilder();
      builder.addLoader(test, loader, option);
      const expectLoader = builder.loaders[builder.loaders.length - 1];
      expect(expectLoader.test).to.equal(test);
      expect(expectLoader.loader).to.equal(require.resolve(loader));
      expect(expectLoader.query.limit).to.equal(1024);
    });

    it('should addLoader#test_loader_option_function', () => {
      const builder = createBuilder();
      const urlLoaders = () => builder.loaders.filter(item => item.test === test);

      builder.addLoader(test, loader, () => merge(option, { query: { name: 'font-url-loader' } }));
      const expectLoader = builder.loaders[builder.loaders.length - 1];
      expect(urlLoaders().length).to.equal(1);
      expect(expectLoader).to.have.property('fn');
      expect(expectLoader.fn().query.limit).to.equal(1024);
      expect(expectLoader.fn().query.name).to.equal('font-url-loader');
    });

    it('should addLoader#object', () => {
      const builder = createBuilder();
      const urlLoaders = () => builder.loaders.filter(item => item.test === test);

      builder.addLoader(merge({
        test,
        loader,
        fn: () => ({ query: { name: 'font-url-loader' } })
      }, option));

      const expectLoader = builder.loaders[builder.loaders.length - 1];
      expect(urlLoaders().length).to.equal(1);
      expect(expectLoader).to.have.property('fn');
      expect(expectLoader.query.limit).to.equal(1024);
      expect(expectLoader.fn().query.name).to.equal('font-url-loader');
    });
  });

  describe('#webpack plugin test', () => {

    it('should addPlugin', () => {
      const builder = createBuilder();
      const count = builder.plugins.length;
      builder.addPlugin(webpack.LoaderOptionsPlugin, () => ({ minimize: false }));
      expect(builder.plugins.length).to.equal(count + 1);
      const webpackPlugins = builder.createWebpackPlugin();
      expect(webpackPlugins.some(plugin => plugin.constructor.name === 'LoaderOptionsPlugin')).to.be.true;
    });

    it('should createWebpackPlugin UglifyJs and StatToJson test', () => {
      const builder = createBuilder();
      builder.setMiniJs(true);
      builder.addStat(true);
      const webpackPlugins = builder.createWebpackPlugin();
      expect(webpackPlugins.length === 2);
      expect(webpackPlugins.some(plugin => plugin.constructor.name === 'UglifyJsPlugin')).to.be.true;
      expect(webpackPlugins.some(plugin => plugin.constructor.name === 'StatsPlugin')).to.be.true;
    });

    it('should createWebpackPlugin createMiniCssPlugin/createMiniImagePlugin/createMiniJsPlugin test', () => {
      const builder = createBuilder();
      builder.setMiniCss(true);
      builder.setMiniImage(true);
      builder.setMiniJs(true);
      builder.addStat(true);
      const webpackPlugins = builder.createWebpackPlugin();
      expect(webpackPlugins.length === 4);
      expect(webpackPlugins.some(plugin => plugin.constructor.name === 'UglifyJsPlugin')).to.be.true;
      expect(webpackPlugins.some(plugin => plugin.constructor.name === 'StatsPlugin')).to.be.true;
    });

    it('should createWebpackPlugin setMiniCss/setMiniImage/setMiniJs test', () => {
      const builder = createBuilder();
      builder.setMiniCss(true);
      builder.setMiniImage(true);
      builder.setMiniJs(true);
      const webpackPlugins = builder.createWebpackPlugin();
      expect(webpackPlugins.length === 3);
      expect(webpackPlugins.some(plugin => plugin.constructor.name === 'UglifyJsPlugin')).to.be.true;
      expect(webpackPlugins.some(plugin => plugin.constructor.name === 'ImageminPlugin')).to.be.true;
    });

  });

  describe('#webpack create test', () => {
    it('should create webpack config', () => {
      const builder = createBuilder();
      const webpackConfig = builder.create();
      expect(webpackConfig).to.include.all.keys('module', 'output', 'resolve', 'plugins');
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
