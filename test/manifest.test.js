'use strict';
const expect = require('chai').expect;
const helper = require('./helper');
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
      expect(!!helper.getPluginByLabel('manifest', plugins)).to.be.false;
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
      expect(!!helper.getPluginByLabel('manifest', plugins)).to.be.true;
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
      expect(!!helper.getPluginByLabel('manifest', plugins)).to.be.true;
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
      expect(!!helper.getPluginByLabel('manifest', plugins)).to.be.false;
    });
  });
});
