'use strict';
const expect = require('chai').expect;
const webpack = require('webpack');
const WebpackBaseBuilder = require('../lib/base');
const Utils = require('../utils/utils');
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

describe('plugin.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#webpack plugin delete test', () => {

    const plugin = webpack.NoEmitOnErrorsPlugin;
    const builder = createBuilder();

    expect(builder.findPluginIndex(plugin) > -1);
    builder.deletePlugin(plugin);
    expect(builder.findPluginIndex(plugin) === -1);

    builder.addPlugin(new webpack.NoEmitOnErrorsPlugin());
    expect(builder.findPluginIndex(plugin) > -1);
    builder.deletePlugin(plugin);
    expect(builder.findPluginIndex(plugin) === -1);

    builder.addPlugin(plugin);
    expect(builder.findPluginIndex(plugin) > -1);
    builder.deletePlugin('NoEmitOnErrorsPlugin');
    expect(builder.findPluginIndex(plugin) === -1);

    expect(builder.deletePlugin(plugin) === null);
  });

  describe('#webpack plugin update test', () => {
    const plugin = webpack.LoaderOptionsPlugin;
    const builder = createBuilder();
    expect(builder.findPluginIndex(plugin) > -1);
    builder.updatePlugin(plugin, { minimize: true });
    const webpackConfig = builder.create();
    const newPlugin = webpackConfig.configPlugin.filter(p =>{
      return p.constructor.name === 'LoaderOptionsPlugin';
    });
    expect(newPlugin[0].options.minimize);
    expect(builder.updatePlugin('LoaderOptionsPlugin_No', { minimize: true }) === null);
  });

  describe('#webpack plugin find test', () => {
    const builder = createBuilder();
    builder.updatePlugin(new webpack.LoaderOptionsPlugin({ minimize: false }));
    const webpackConfig = builder.create();
    const newPlugin = webpackConfig.configPlugin.filter(p =>{
      return p.constructor.name === 'LoaderOptionsPlugin';
    });
    expect(newPlugin[0].options.minimize === false);

    builder.updatePlugin(new webpack.LoaderOptionsPlugin({ minimize: true }));
    const newPlugin2 = webpackConfig.configPlugin.filter(p =>{
      return p.constructor.name === 'LoaderOptionsPlugin';
    });
    expect(newPlugin2[0].options.minimize === true);
  });
});
