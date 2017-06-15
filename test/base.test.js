'use strict';
const expect = require('chai').expect;
const webpack = require('webpack');
const merge = require('webpack-merge');
const WebpackBaseBuilder = require('../lib/base');
const Loader = require('../utils/loader');

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
    });

    it('should createWebpackPlugin enable false test', () => {
      const builder = new WebpackBaseBuilder();
      const webpackPlugins = builder.createWebpackPlugin();
      expect(webpackPlugins.some(plugin => plugin.constructor.name === 'UglifyJsPlugin')).to.be.false;
      expect(webpackPlugins.some(plugin => plugin.constructor.name === 'StatsPlugin')).to.be.false;
    });

    it('should createWebpackPlugin UglifyJs and StatToJson test', () => {
      const builder = new WebpackBaseBuilder();
      builder.setUglifyJs(true);
      builder.setStatToJson(true);
      const webpackPlugins = builder.createWebpackPlugin();
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

  describe('#webpack loader change test', () => {
    it('should updateLoader', () => {
      this.builder.setStyleLoaderName('vue-style-loader');
      this.builder.addLoader(/\.vue$/, 'vue-loader', () => ({
        options: Loader.getStyleLoaderOption(this.builder.getStyleConfig())
      }));
      this.builder.updateLoader({
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

      const newLoaderIndex = this.builder.findLoaderIndex('vue-loader');
      const newLoader = this.builder.loaders[newLoaderIndex];
      expect(typeof newLoader.fn === 'function').to.be.true;
      expect(newLoader.options).to.have.property('compilerModules');

      const webpackConfig = this.builder.create();
      const rules = webpackConfig.module.rules;
      const vueLoaderIndex = rules.findIndex(rule => rule.loader.includes('vue-loader'));
      const vueLoader = rules[vueLoaderIndex];
      expect(vueLoader.options).to.have.property('loaders');
      expect(vueLoader.options).to.have.property('compilerModules');
    });
  });


  describe('#webpack plugin change test', () => {
    const pluginBuilder = new WebpackBaseBuilder();
    it('should findPluginIndex', () => {
      expect(pluginBuilder.findPluginIndex(webpack.NoEmitOnErrorsPlugin) > -1).to.be.true;
      expect(pluginBuilder.findPluginIndex(new webpack.NoEmitOnErrorsPlugin()) > -1).to.be.true;
    });
    it('should deletePlugin', () => {
      pluginBuilder.deletePlugin(webpack.NoEmitOnErrorsPlugin);
      expect(pluginBuilder.findPluginIndex(webpack.NoEmitOnErrorsPlugin) > -1).to.be.false;
      expect(pluginBuilder.findPluginIndex(new webpack.NoEmitOnErrorsPlugin()) > -1).to.be.false;
    });
  });

});
