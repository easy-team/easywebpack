'use strict';
const expect = require('chai').expect;
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const utils = require('../utils/utils');
const WebpackClientBuilder = require('../lib/client')
const WebpackServerBuilder = require('../lib/server');
const path = require('path').posix;
const baseDir = path.join(__dirname, '..');

class ClientBuilder extends WebpackClientBuilder {
  constructor(config) {
    super(config);
    this.mergeConfig({
      plugins: {
        manifest: false
      }
    });
  }
}

function getPluginByLabel(label, plugins) {
  return plugins.find(plugin => {
    return plugin.__lable__ === label;
  });
}

describe('manifest.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#webpack manifest test', () => {
    it('should not use manifest config test', () => {
      const builder = new ClientBuilder({
        baseDir,
        entry: {
          include: __dirname,
          template: 'test/layout.html'
        }
      });
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      expect(!!getPluginByLabel('manifest', plugins)).to.be.false;
      expect(!!getPluginByLabel('commonsChunk', plugins)).to.be.true;
      expect(!!getPluginByLabel('runtime', plugins)).to.be.true;
    });
  });

  describe('#webpack manifest test', () => {
    it('should use manifest config test', () => {
      const builder = new ClientBuilder({
        baseDir,
        entry: {
          include: __dirname,
          template: 'test/layout.html'
        },
        plugins: {
          manifest: true
        }
      });
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      expect(!!getPluginByLabel('manifest', plugins)).to.be.true;
    });
  });

  describe('#webpack manifest test', () => {
    it('should use manifest config test', () => {
      const builder = new ClientBuilder({
        baseDir,
        entry: {
          include: __dirname,
          template: 'test/layout.html'
        },
        plugins: {
          manifest: true,
        }
      });
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      expect(!!getPluginByLabel('manifest', plugins)).to.be.true;
    });
  });
  describe('#webpack server manifest test', () => {
    it('should use manifest config test', () => {
      const builder = new WebpackServerBuilder({
        baseDir,
        entry: {
          include: __dirname
        }
      });
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      expect(!!getPluginByLabel('manifest', plugins)).to.be.false;
    });
  });
});
