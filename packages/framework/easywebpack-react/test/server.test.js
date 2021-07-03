'use strict';
const expect = require('chai').expect;
const easywebpack = require('easywebpack');
const webpack = easywebpack.webpack;
const merge = easywebpack.merge;
const WebpackServerBuilder = require('../lib/server');
const path = require('path').posix;

// http://chaijs.com/api/bdd/
function createBuilder(config) {
  const builder = new WebpackServerBuilder(merge({
    cost: true,
    buildPath: 'dist/client',
    publicPath: '/public',
    entry: {
      'client.test' : path.join(__dirname, 'test/client.test.js')
    }
  }, config));
  if (config && config.type) {
    builder.type = config.type;
  }
  return builder;
}

function getLoaderByName(name, rules) {
  const loaderName = `${name}-loader`;
  return rules.find(rule => {
    return rule.use.some(loader => {
      return loaderName === loader || (typeof loader === 'object' && loader.loader === loaderName);
    });
  });
}

function getPluginByLabel(label, plugins) {
  return plugins.find(plugin => {
    return plugin.__lable__ === label || plugin.__plugin__ === label;
  });
}

describe('server.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });
  
  describe('#webpack hook test', () => {
    it('should create test', () => {
      const builder = createBuilder({
        create(){
          this.addEntry('config', path.join(__dirname, '../config/config.js'));
        },
        onServer(){
          this.addEntry('plugin', path.join(__dirname, '../utils/plugin.js'));
        }
      });
      const webpackConfig = builder.create();
      expect(webpackConfig.entry).to.include.keys(['client.test', 'config', 'plugin']);
    });
  });

  describe('#webpack externals test', () => {
    it('should externals config test', () => {
      const builder = createBuilder({});
      const webpackConfig = builder.create();
      expect(webpackConfig.externals.length).to.equal(1);
      expect(typeof webpackConfig.externals[0] === 'function').to.be.true;
    });

    it('should externals not use default config test', () => {
      const builder = createBuilder({
        nodeExternals : {
          useDefault: false
        }
      });
      const webpackConfig = builder.create();
      expect(webpackConfig.externals.length).to.equal(1);
      expect(typeof webpackConfig.externals[0] === 'function').to.be.true;
    });
  });
});