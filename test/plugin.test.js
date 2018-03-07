'use strict';
const expect = require('chai').expect;
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const WebpackBaseBuilder = require('../lib/base');
const path = require('path').posix;

// http://chaijs.com/api/bdd/
function createBuilder(config) {
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
}

function getPluginByLabel(label, plugins) {
  return plugins.find(plugin => {
    return plugin.__lable__ === label || plugin.__plugin__ === label;
  });
}

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
      // expect(!!getPluginByLabel('module', plugins)).to.be.false;
      // expect(!!getPluginByLabel('error', plugins)).to.be.true;
      expect(!!getPluginByLabel('provide', plugins)).to.be.true;
      expect(!!getPluginByLabel('define', plugins)).to.be.true;
      expect(!!getPluginByLabel('progress', plugins)).to.be.true;
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
      const provide = getPluginByLabel('provide', plugins);
      expect(provide.definitions).to.have.property('$');
      expect(!!getPluginByLabel('manifest', plugins)).to.be.true;
    });

    it('should plugin client dev enable test', () => {
      const builder1 = createBuilder({
        type: 'client'
      });
      const webpackConfig1 = builder1.create();
      const plugins = webpackConfig1.plugins;
      expect(!!getPluginByLabel('hot', plugins)).to.be.true;
      expect(!!getPluginByLabel('manifest', plugins)).to.be.true;
      expect(!!getPluginByLabel('commonsChunk', plugins)).to.be.true;
    });

    it('should plugin client test enable test', () => {
      const builder1 = createBuilder({
        type: 'client',
        env: 'test'
      });
      const webpackConfig1 = builder1.create();
      const plugins = webpackConfig1.plugins;
      expect(!!getPluginByLabel('hot', plugins)).to.be.false;
      expect(!!getPluginByLabel('uglifyJs', plugins)).to.be.false;
      expect(!!getPluginByLabel('imagemini', plugins)).to.be.false;
      expect(!!getPluginByLabel('ignore', plugins)).to.be.false;
      expect(!!getPluginByLabel('modulereplacement', plugins)).to.be.false;
      expect(!!getPluginByLabel('extract', plugins)).to.be.true;
      expect(!!getPluginByLabel('manifest', plugins)).to.be.true;
    });

    it('should plugin client prod enable test', () => {
      const builder1 = createBuilder({
        type: 'client',
        env: 'prod'
      });
      const webpackConfig1 = builder1.create();
      const plugins = webpackConfig1.plugins;

      expect(!!getPluginByLabel('hot', plugins)).to.be.false;
      expect(!!getPluginByLabel('uglifyJs', plugins)).to.be.true;
      expect(!!getPluginByLabel('imagemini', plugins)).to.be.true;
      expect(!!getPluginByLabel('ignore', plugins)).to.be.false;
      expect(!!getPluginByLabel('modulereplacement', plugins)).to.be.false;
      expect(!!getPluginByLabel('extract', plugins)).to.be.true;
      expect(!!getPluginByLabel('manifest', plugins)).to.be.true;
    });

    it('should plugin server dev enable test', () => {
      const builder1 = createBuilder({
        type: 'server',
        env: 'dev'
      });
      const webpackConfig1 = builder1.create();
      const plugins = webpackConfig1.plugins;
      expect(!!getPluginByLabel('hot', plugins)).to.be.false;
      expect(!!getPluginByLabel('uglifyJs', plugins)).to.be.false;
      expect(!!getPluginByLabel('imagemini', plugins)).to.be.false;
      expect(!!getPluginByLabel('ignore', plugins)).to.be.false;
      expect(!!getPluginByLabel('modulereplacement', plugins)).to.be.false;
      expect(!!getPluginByLabel('extract', plugins)).to.be.false;
    });

    it('should plugin server test enable test', () => {
      const builder1 = createBuilder({
        type: 'server',
        env: 'test'
      });
      const webpackConfig1 = builder1.create();
      const plugins = webpackConfig1.plugins;
      expect(!!getPluginByLabel('hot', plugins)).to.be.false;
      expect(!!getPluginByLabel('uglifyJs', plugins)).to.be.false;
      expect(!!getPluginByLabel('imagemini', plugins)).to.be.false;
      expect(!!getPluginByLabel('ignore', plugins)).to.be.true;
      expect(!!getPluginByLabel('modulereplacement', plugins)).to.be.true;
      expect(!!getPluginByLabel('extract', plugins)).to.be.false;
    });

    it('should plugin server prod enable test', () => {
      const builder1 = createBuilder({
        type: 'server',
        env: 'prod'
      });
      const webpackConfig1 = builder1.create();
      const plugins = webpackConfig1.plugins;
      expect(!!getPluginByLabel('hot', plugins)).to.be.false;
      expect(!!getPluginByLabel('uglifyJs', plugins)).to.be.true;
      expect(!!getPluginByLabel('imagemini', plugins)).to.be.false;
      expect(!!getPluginByLabel('ignore', plugins)).to.be.true;
      expect(!!getPluginByLabel('modulereplacement', plugins)).to.be.true;
      expect(!!getPluginByLabel('extract', plugins)).to.be.false;
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
      const dll = getPluginByLabel('DllPlugin', plugins);
      expect(!!dll).to.be.true;
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
      const dll = getPluginByLabel('DllPlugin', plugins);
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
      const dll = getPluginByLabel('DllPlugin', plugins);
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
      const dll = getPluginByLabel('DllPlugin', plugins);
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
      const dll = getPluginByLabel('DllPlugin', plugins);
      expect(!!dll).to.be.true;
    });
    it('should merge array extend key plugin test', () => {
      const builder = createBuilder({});
      builder.mergePlugin([{ dll : {
        enable: true,
        name: webpack.DllPlugin,
        args: {
          path: 'manifest.json',
          name: '[name]_[chunkhash]',
          context: __dirname
        }
      }}]);
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      const dll = getPluginByLabel('DllPlugin', plugins);
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
      const dll = getPluginByLabel('DllPlugin', plugins);
      expect(!!dll).to.be.true;
    });
  });
});