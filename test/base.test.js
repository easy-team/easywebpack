'use strict';
const expect = require('chai').expect;
const webpack = require('webpack');
const merge = require('webpack-merge');
const WebpackBaseBuilder = require('../lib/base');

// http://chaijs.com/api/bdd/

describe('base.test.js', () => {
  before(() => {
    this.builder = new WebpackBaseBuilder();
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#webpack options test', () => {
    it('should setOption', () => {
      const optionPluginCount = this.builder.options.plugins && this.builder.options.plugins.length || 1;

      this.builder.setOption({
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
      expect(this.builder.options.output.path).to.equal(__dirname);
      expect(this.builder.options.output.publicPath).to.equal(__dirname);
      expect(this.builder.options.resolve.extensions).to.have.lengthOf(3);
      expect(this.builder.options.plugins).to.have.lengthOf(optionPluginCount + 1);
    });
  });

  describe('#webpack public method test', () => {
    it('should setAlias', () => {
      this.builder.setAlias('vue', 'vue/dist/vue.common.js');
      expect(this.builder.options.resolve.alias).to.have.property('vue');
      const webpackConfig = this.builder.create();
      expect(webpackConfig.resolve.alias).to.have.property('vue');
    });
    it('should setExtensions', () => {
      this.builder.setExtensions('.vue');
      this.builder.setExtensions(['.css', '.jsx']);
      expect(this.builder.options.resolve.extensions).to.include.members(['.vue', '.css', '.jsx']);
      const webpackConfig = this.builder.create();
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
    const urlLoaders = () => this.builder.loaders.filter(item => item.test === test);

    it('should addLoader#test_loader_option', () => {
      this.builder.addLoader(test, loader, option);
      const expectLoader = this.builder.loaders[this.builder.loaders.length - 1];
      expect(expectLoader.test).to.equal(test);
      expect(expectLoader.loader).to.equal(require.resolve(loader));
      expect(expectLoader.query.limit).to.equal(1024);
    });

    it('should addLoader#test_loader_option_function', () => {
      this.builder.addLoader(test, loader, () => merge(option, { query: { name: 'font-url-loader' } }));
      const expectLoader = this.builder.loaders[this.builder.loaders.length - 1];
      expect(urlLoaders().length).to.equal(2);
      expect(expectLoader).to.have.property('fn');
      expect(expectLoader.fn().query.limit).to.equal(1024);
      expect(expectLoader.fn().query.name).to.equal('font-url-loader');
    });

    it('should addLoader#object', () => {
      this.builder.addLoader(merge({
        test,
        loader,
        fn: () => ({ query: { name: 'font-url-loader' } })
      }, option));

      const expectLoader = this.builder.loaders[this.builder.loaders.length - 1];
      expect(urlLoaders().length).to.equal(3);
      expect(expectLoader).to.have.property('fn');
      expect(expectLoader.query.limit).to.equal(1024);
      expect(expectLoader.fn().query.name).to.equal('font-url-loader');
    });

  });

  describe('#webpack plugin test', () => {
    it('should addPlugin', () => {
      const count = this.builder.plugins.length;
      this.builder.addPlugin(webpack.LoaderOptionsPlugin, () => ({ minimize: false }));
      const expectPlugin = this.builder.plugins[this.builder.plugins.length - 1];
      expect(this.builder.plugins.length).to.equal(count + 1);
      expect(expectPlugin).to.have.property('clazz');
      expect(expectPlugin.clazz.name).to.equal('LoaderOptionsPlugin');

      this.builder.addPlugin(webpack.LoaderOptionsPlugin, () => ({ minimize: false }), true);
      expect(this.builder.plugins[0].clazz.name).to.equal('LoaderOptionsPlugin');

    });

    it('should createWebpackPlugin test', () => {
      const webpackPlugins = this.builder.createWebpackPlugin();
      expect(webpackPlugins.filter(plugin => typeof plugin === 'object').length).to.equal(webpackPlugins.length);
      expect(webpackPlugins.some(plugin => plugin.constructor.name === 'UglifyJsPlugin')).to.be.false;
      expect(webpackPlugins.some(plugin => plugin.constructor.name === 'StatsPlugin')).to.be.false;
    });

    it('should createWebpackPlugin UglifyJs and StatToJson test', () => {
      this.builder.setUglifyJs(true);
      this.builder.setStatToJson(true);
      const webpackPlugins = this.builder.createWebpackPlugin();
      expect(webpackPlugins.some(plugin => plugin.constructor.name === 'UglifyJsPlugin')).to.be.true;
      expect(webpackPlugins.some(plugin => plugin.constructor.name === 'StatsPlugin')).to.be.true;
    });
  });

  describe('#webpack create test', () => {
    it('should create webpack config', () => {
      const webpackConfig = this.builder.create();
      expect(webpackConfig).to.include.all.keys('entry', 'module', 'output', 'resolve', 'plugins');
      expect(webpackConfig.module.rules).to.be.an('array');
      expect(webpackConfig.plugins).to.be.an('array');
      expect(webpackConfig.resolve.extensions).to.be.an('array').that.includes('.js');
    });
  });

});
