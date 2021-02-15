'use strict';
const path = require('path');
const expect = require('chai').expect;
const easywebpack = require('easywebpack');
const webpack = easywebpack.webpack;
const merge = easywebpack.merge;
const WebpackClientBuilder = require('../lib/client');

// http://chaijs.com/api/bdd/
function createBaseBuilder(config) {
  const builder = new WebpackClientBuilder(config);
  builder.setBuildPath(path.join(__dirname, 'dist/client'));
  builder.setPublicPath('/public');
  return builder;
}

function createBuilder(config) {
  const builder = new WebpackClientBuilder(merge({
    entry: {
      'client.test' : path.join(__dirname, 'test/client.test.js')
    }
  }, config));
  if (config && config.type) {
    builder.type = config.type;
  }
  builder.setBuildPath(path.join(__dirname, 'dist/client'));
  builder.setPublicPath('/public');
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

describe('client.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });



  describe('#webpack client dev test', () => {
    it('should dev hot test', () => {
      const builder = createBuilder({ env: 'dev', log: true });
      const webpackConfig = builder.create();
      expect(webpackConfig.entry['client.test'].length).to.equal(3);
    });
    it('should html test', () => {
      const builder = createBuilder({
        template: path.join(__dirname, 'layout.html')
      });
      const webpackConfig = builder.create();
      const html = webpackConfig.plugins.filter(plugin => {
        return plugin.__plugin__ === 'html-webpack-plugin';
      });
      expect(html.length).to.equal(Object.keys(webpackConfig.entry).length);
    });
  });

  describe('#webpack publicPath test', () => {
    const cdnUrl = 'http://easywebpack.cn';
    it('should dev cdn config test', () => {
      const builder = createBuilder({ debug: true, env: 'dev', cdn: { url: cdnUrl} });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal('/public/');
    });

    it('should dev cdn config test', () => {
      const builder = createBuilder({ debug: true, env: 'dev', cdn: { url: cdnUrl} });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal('/public/');
    });

    it('should dev publicPath config test', () => {
      const builder = createBuilder({ debug: true, env: 'dev', publicPath: '/static' });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal('/static/');
    });

    it('should dev publicPath env test config test', () => {
      const builder = createBuilder({ debug: true, env: 'test', publicPath: '/static' });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal('/static/');
    });
  });

  describe('#webpack commonsChunk test', () => {
    it('should dev cdn config test', () => {
      const builder = createBuilder({ env: 'dev', lib: ['mocha'] });
      const webpackConfig = builder.create();
      const commonsChunks = webpackConfig.plugins.filter(plugin =>{
        return plugin.constructor.name === 'SplitChunksPlugin' || plugin.constructor.name === 'RuntimeChunkPlugin';
      });
      expect(webpackConfig.entry).to.have.property('common');
      expect(commonsChunks.length).to.equal(2);
    });
  });
});