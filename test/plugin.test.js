'use strict';
const expect = require('chai').expect;
const WebpackTool = require('webpack-tool');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = WebpackTool.webpack;
const WebpackBaseBuilder = require('../lib/target/base');
const path = require('path').posix;
const utils = require('../utils/utils');
const helper = require('./helper');
// http://chaijs.com/api/bdd/
const createBuilder = config => {
  const builder = new WebpackBaseBuilder(config);
  if (config && config.type) {
    builder.type = config.type;
  }
  builder.setBuildPath(path.join(__dirname, '../dist/pluglin'));
  builder.setPublicPath('/public');
  builder.setEntry({
    include: path.join(__dirname, '../test')
  });
  return builder;
};

describe('plugin.test.js', () => {
  before(() => {});

  after(() => {});

  beforeEach(() => {});

  afterEach(() => {});

  describe('#webpack createWebpackPlugin test', () => {
    it('should plugin default enable test', () => {
      const builder1 = createBuilder();
      const webpackConfig1 = builder1.create();
      const plugins = webpackConfig1.plugins;
      // expect(!!helper.getPluginByLabel('module', plugins)).to.be.false;
      // expect(!!helper.getPluginByLabel('error', plugins)).to.be.true;
      expect(!!helper.getPluginByLabel('provide', plugins)).to.be.true;
      expect(!!helper.getPluginByLabel('define', plugins)).to.be.true;
      expect(!!helper.getPluginByLabel('progress', plugins)).to.be.true;
    });

    it('should plugin manifest enable test', () => {
      const builder1 = createBuilder({
        type: 'client',
        plugins: {
          manifest: true
        }
      });
      builder1.setProvide('$', 'jquery');
      const webpackConfig1 = builder1.create();
      const plugins = webpackConfig1.plugins;
      const provide = helper.getPluginByLabel('provide', plugins);
      expect(provide.definitions).to.have.property('$');
      expect(!!helper.getPluginByLabel('manifest', plugins)).to.be.true;
    });

    it('should plugin client dev enable test', () => {
      const builder1 = createBuilder({
        type: 'client'
      });
      const webpackConfig1 = builder1.create();
      const plugins = webpackConfig1.plugins;
      expect(!!helper.getPluginByLabel('hot', plugins)).to.be.true;
      expect(!!helper.getPluginByLabel('manifest', plugins)).to.be.true;
    });

    it('should plugin client test enable test', () => {
      const builder1 = createBuilder({
        type: 'client',
        env: 'test'
      });
      const webpackConfig1 = builder1.create();
      const plugins = webpackConfig1.plugins;
      expect(!!helper.getPluginByLabel('hot', plugins)).to.be.false;
      expect(!!helper.getPluginByLabel('cssmini', plugins)).to.be.false;
      expect(!!helper.getPluginByLabel('imagemini', plugins)).to.be.false;
      expect(!!helper.getPluginByLabel('ignore', plugins)).to.be.false;
      expect(!!helper.getPluginByLabel('modulereplacement', plugins)).to.be.false;
      expect(!!helper.getPluginByLabel('extract', plugins)).to.be.true;
      expect(!!helper.getPluginByLabel('manifest', plugins)).to.be.true;
    });

    it('should plugin client prod enable test', () => {
      const builder1 = createBuilder({
        type: 'client',
        env: 'prod'
      });
      const webpackConfig1 = builder1.create();
      const plugins = webpackConfig1.plugins;

      expect(!!helper.getPluginByLabel('hot', plugins)).to.be.false;
      expect(!!helper.getPluginByLabel('cssmini', plugins)).to.be.true;
      expect(!!helper.getPluginByLabel('imagemini', plugins)).to.be.true;
      expect(!!helper.getPluginByLabel('ignore', plugins)).to.be.false;
      expect(!!helper.getPluginByLabel('modulereplacement', plugins)).to.be.false;
      expect(!!helper.getPluginByLabel('extract', plugins)).to.be.true;
      expect(!!helper.getPluginByLabel('manifest', plugins)).to.be.true;
    });

    it('should plugin server dev enable test', () => {
      const builder1 = createBuilder({
        type: 'server',
        env: 'dev'
      });
      const webpackConfig1 = builder1.create();
      const plugins = webpackConfig1.plugins;
      expect(!!helper.getPluginByLabel('hot', plugins)).to.be.false;
      expect(!!helper.getPluginByLabel('imagemini', plugins)).to.be.false;
      expect(!!helper.getPluginByLabel('ignore', plugins)).to.be.false;
      expect(!!helper.getPluginByLabel('modulereplacement', plugins)).to.be.false;
      expect(!!helper.getPluginByLabel('extract', plugins)).to.be.false;
    });

    it('should plugin server test enable test', () => {
      const builder1 = createBuilder({
        type: 'server',
        env: 'test'
      });
      const webpackConfig1 = builder1.create();
      const plugins = webpackConfig1.plugins;
      expect(!!helper.getPluginByLabel('hot', plugins)).to.be.false;
      expect(!!helper.getPluginByLabel('imagemini', plugins)).to.be.false;
      expect(!!helper.getPluginByLabel('ignore', plugins)).to.be.true;
      expect(!!helper.getPluginByLabel('modulereplacement', plugins)).to.be.true;
      expect(!!helper.getPluginByLabel('extract', plugins)).to.be.false;
    });

    it('should plugin server prod enable test', () => {
      const builder1 = createBuilder({
        type: 'server',
        env: 'prod'
      });
      const webpackConfig1 = builder1.create();
      const plugins = webpackConfig1.plugins;
      expect(!!helper.getPluginByLabel('hot', plugins)).to.be.false;
      expect(!!helper.getPluginByLabel('imagemini', plugins)).to.be.false;
      expect(!!helper.getPluginByLabel('ignore', plugins)).to.be.true;
      expect(!!helper.getPluginByLabel('modulereplacement', plugins)).to.be.true;
      expect(!!helper.getPluginByLabel('extract', plugins)).to.be.false;
    });

    it('should merge plugin test', () => {
      const builder = createBuilder({
        plugins: {
          dll: {
            enable: true,
            name: webpack.DllPlugin,
            args: {
              path: 'manifest.json',
              name: '[name]_[chunkhash]',
              context: __dirname
            }
          }
        }
      });
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      const dll = helper.getPluginByLabel('DllPlugin', plugins);
      expect(!!dll).to.be.true;
    });

    it('should merge apply plugin test', () => {
      const builder = createBuilder({
        plugins: {
          copy: new CopyWebpackPlugin([{ from: 'asset', to: 'public' }])
        }
      });
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      const copy = helper.getPluginByLabel('copy', plugins);
      expect(!!copy).to.be.true;
    });

    it('should multile same webpack plugin test', () => {
      const builder = createBuilder({
        plugins: [
          new HtmlWebpackPlugin({
            chunks: ['runtime','common', 'app'],
            filename: '../view/app.tpl',
            template: './app/web/view/layout.tpl'
          }),
          new HtmlWebpackPlugin({
            chunks: ['runtime','common', 'test'],
            filename: '../view/test.tpl',
            template: './app/web/view/layout.tpl'
          }),
        ]
      });
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      const htmls = helper.getPluginsByLabel('HtmlWebpackPlugin', plugins);
      expect(htmls.length).to.equal(2);
    });

    it('should multile same webpack plugin key config test', () => {
      const builder = createBuilder({
        plugins: [
          {
            app: new HtmlWebpackPlugin({
              chunks: ['runtime','common', 'app'],
              filename: '../view/app.tpl',
              template: './app/web/view/layout.tpl'
            }),
          },
          {
            test: new HtmlWebpackPlugin({
              chunks: ['runtime','common', 'test'],
              filename: '../view/test.tpl',
              template: './app/web/view/layout.tpl'
            }),
          }
        ]
      });
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      const htmls = helper.getPluginsByLabel('HtmlWebpackPlugin', plugins);
      expect(htmls.length).to.equal(2);
    });

    it('should add webpack plugin test', () => {
      const builder = createBuilder({});
      builder.addPlugin(new webpack.DllPlugin({
        path: 'manifest.json',
        name: '[name]_[chunkhash]',
        context: __dirname
      }));
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      const dll = helper.getPluginByLabel('DllPlugin', plugins);
      expect(!!dll).to.be.true;
    });

    it('should add extend plugin test', () => {
      const builder = createBuilder({});
      builder.addPlugin({
        dll: {
          enable: true,
          name: webpack.DllPlugin,
          args: {
            path: 'manifest.json',
            name: '[name]_[chunkhash]',
            context: __dirname
          }
        }
      });
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      const dll = helper.getPluginByLabel('DllPlugin', plugins);
      expect(!!dll).to.be.true;
    });

    it('should merge array webpack plugin test', () => {
      const builder = createBuilder({});
      builder.mergePlugin([
        new webpack.DllPlugin({
          path: 'manifest.json',
          name: '[name]_[chunkhash]',
          context: __dirname
        })
      ]);
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      const dll = helper.getPluginByLabel('DllPlugin', plugins);
      expect(!!dll).to.be.true;
    });

    it('should merge array extend plugin test', () => {
      const builder = createBuilder({});
      builder.mergePlugin([{
        enable: true,
        name: webpack.DllPlugin,
        args: {
          path: 'manifest.json',
          name: '[name]_[chunkhash]',
          context: __dirname
        }
      }]);
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      const dll = helper.getPluginByLabel('DllPlugin', plugins);
      expect(!!dll).to.be.true;
    });
    it('should merge array extend key plugin test', () => {
      const builder = createBuilder({});
      builder.mergePlugin([{
        dll: {
          enable: true,
          name: webpack.DllPlugin,
          args: {
            path: 'manifest.json',
            name: '[name]_[chunkhash]',
            context: __dirname
          }
        }
      }]);
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      const dll = helper.getPluginByLabel('DllPlugin', plugins);
      expect(!!dll).to.be.true;
    });

    it('should merge array extend name object plugin test', () => {
      const builder = createBuilder({});
      builder.mergePlugin([{
        name: new webpack.DllPlugin({
          path: 'manifest.json',
          name: '[name]_[chunkhash]',
          context: __dirname
        })
      }
      ]);
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      const dll = helper.getPluginByLabel('DllPlugin', plugins);
      expect(!!dll).to.be.true;
    });
  });
});