'use strict';
const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const WebpackClientBuilder = require('../lib/client');
const Loader = require('../utils/loader');
const Utils = require('../utils/utils');
const ManifestPlugin = require('webpack-manifest-plugin');

// http://chaijs.com/api/bdd/
function createBuilder(config = {}) {
  const builder = new WebpackClientBuilder(config);
  builder.setBuildPath(path.join(__dirname, 'test'));
  builder.setEntry({
    include: path.join(__dirname, '../test')
  });
  return builder;
}

describe('client.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#webpack create test', () => {

    it('should config create', () => {
      const config = {
        env: 'dev', egg: true, create: () => {
          builder.addPack('pack/base', 'test/base.test.js');
        }
      };
      const builder = createBuilder(config);
      const webpackConfig = builder.create();
      expect(webpackConfig.entry['pack/base'][0]).to.equal(path.join(__dirname, 'base.test.js'));
    });

    it('should add stat', () => {
      const config = {
        env: 'dev', egg: true, pluginOption: {
          stat: true
        }
      };
      const builder = createBuilder(config);
      const webpackConfig = builder.create();
      const count = webpackConfig.plugins.filter(p =>{
        return p.constructor.name === 'StatsPlugin';
      }).length;
      expect(count).to.equal(1);
    });

    it('should addPack test', () => {
      const builder = createBuilder({ env: 'dev', egg: true });
      builder.addPack('pack/base', 'test/base.test.js');
      builder.addPack({
        'pack/client': 'test/client.test.js',
        'pack/all': ['test/client.test.js', 'test/server.test.js']
      });
      expect(Object.keys(builder.packs).length === 3).to.be.true;
      expect(Object.keys(builder.options.entry).length === 3).to.be.true;
    });

    it('should create webpack config', () => {
      const builder = createBuilder();
      builder.addEntry('home/list', 'app/web/page/home/list.js');
      builder.addProvide({ $: 'jquery' });
      builder.setCommonsChunk('vendor');
      builder.setCommonsChunk(['vendor2']);
      const webpackConfig = builder.create();
      expect(webpackConfig).to.include.all.keys('module', 'output', 'resolve', 'plugins');
      expect(webpackConfig.module.rules).to.be.an('array');
      expect(webpackConfig.plugins).to.be.an('array');
      expect(webpackConfig.resolve.extensions).to.be.an('array').that.includes('.js');
      expect(webpackConfig.entry['home/list']).to.include('app/web/page/home/list.js');
      expect(builder.findPluginIndex('ProvidePlugin') > -1);

      const newPlugin = webpackConfig.plugins.filter(p => {
        return p.constructor.name === 'CommonsChunkPlugin';
      });
      expect(newPlugin[0].chunkNames.toString() === 'vendor2').to.be.true;
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
      const newLoaderIndex = builder.findLoaderIndex('vue-loader', 'loader');
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

  describe('#webpack create test', () => {
    it('should create dev test', () => {
      const builder = createBuilder({ env: 'dev' });
      const webpackConfig1 = builder.create();
      expect(webpackConfig1.output.publicPath).to.include(Utils.getHost(9000));
      expect(webpackConfig1.output.filename).to.include('client/js/[name].js');
      expect(webpackConfig1.output.chunkFilename).to.include('client/js/chunk/[name].js');
      expect(builder.findPluginIndex(builder.webpack.HotModuleReplacementPlugin) > -1).to.be.true;

      const plugin = webpackConfig1.plugins.filter(p => {
        return p.constructor.name === 'ExtractTextPlugin';
      });
      expect(plugin.length === 0).to.be.true;
    });

    it('should create test test', () => {
      const builder = createBuilder({ env: 'test' });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.not.include(Utils.getHost(9000));
    });

    it('should create prod test', () => {
      const builder = createBuilder();
      builder.hasPlugin = name => {
        return builder.webpackConfig.plugins.some(p => {
          return p.constructor.name === name;
        });
      };
      builder.setEnv('prod');
      const webpackConfig = builder.create();
      builder.webpackConfig = webpackConfig;
      expect(webpackConfig.output.publicPath).to.equal('/public/');
      expect(webpackConfig.output.filename).to.include('js/[name].[chunkhash:8].js');
      expect(webpackConfig.output.chunkFilename).to.include('js/chunk/[name].[chunkhash:8].js');
      expect(builder.hasPlugin('ImageminPlugin')).to.be.true;
      expect(builder.hasPlugin('UglifyJsPlugin')).to.be.true;
      expect(builder.hasPlugin('NoEmitOnErrorsPlugin')).to.be.true;
      expect(builder.hasPlugin('DefinePlugin')).to.be.true;
      expect(builder.hasPlugin('LoaderOptionsPlugin')).to.be.true;
      expect(builder.hasPlugin('ProgressPlugin')).to.be.true;
      expect(builder.hasPlugin('ExtractTextPlugin')).to.be.true;
      expect(builder.hasPlugin('ManifestPlugin')).to.be.true;
      expect(builder.hasPlugin('HotModuleReplacementPlugin')).to.be.false;
    });
  });

  describe('#webpack publicPath test', () => {
    it('should setPublicPath test', () => {
      const builder = createBuilder();
      expect(builder.publicPath).to.include(Utils.getHost(9000));
      builder.setProxy(true);

      builder.setPublicPath('/public/static/');
      expect(builder.publicPath).to.equal('/public/static/');
      builder.setPublicPath('js', false);
      expect(builder.publicPath).to.equal('/public/static/js/');
      builder.setCDN('http://cdn.com');
      expect(builder.publicPath).to.equal('http://cdn.com/');
      builder.setCDN('http://cdn.com', '2017');
      expect(builder.publicPath).to.equal('http://cdn.com/2017/');

      builder.setDevTool('sourcemap');
      const webpackConfig = builder.create();
      expect(webpackConfig.devtool).to.equal('sourcemap');
    });
  });

  describe('#webpack html test', () => {

    it('should config html test', () => {
      const builder = createBuilder({ env: 'dev', egg: true });
      builder.setEntry({ html: true, include: ['test'], exclude: [], template: 'test/layout.html' });
      const webpackConfig = builder.create();
      const htmlCount = webpackConfig.plugins.filter(p => {
        return p.constructor.name === 'HtmlWebpackPlugin';
      }).length;
      expect(htmlCount === 5).to.be.true;
    });

    it('should setHtml test', () => {
      const builder = createBuilder({ env: 'dev', egg: true });
      builder.setHtml({ include: ['test'], exclude: [], template: 'test/layout.html' });
      const webpackConfig = builder.create();
      const htmlCount = webpackConfig.plugins.filter(p => {
        return p.constructor.name === 'HtmlWebpackPlugin';
      }).length;
      expect(htmlCount === 5).to.be.true;
    });

    it('should setHtml commonsChunk test', () => {
      const builder = createBuilder({ env: 'dev', egg: true });
      builder.setCommonsChunk('vendor');
      builder.setHtml({ include: ['test'], exclude: [], template: 'test/layout.html' });
      const webpackConfig = builder.create();
      const htmlCount = webpackConfig.plugins.filter(p => {
        return p.constructor.name === 'HtmlWebpackPlugin';
      }).length;
      expect(htmlCount === 5).to.be.true;
    });
  });

  describe('#webpack build config test', () => {
    it('should create build config test', () => {
      const builder = createBuilder({ env: 'dev', egg: true });
    });
  });

});
