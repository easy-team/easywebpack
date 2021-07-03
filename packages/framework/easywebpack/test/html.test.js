'use strict';
const expect = require('chai').expect;
const WebpackClientBuilder = require('../lib/target/client');
const path = require('path').posix;
const helper = require('./helper');

// http://chaijs.com/api/bdd/
function createBuilder(config) {
  const builder = new WebpackClientBuilder(config);
  if (config && config.type) {
    builder.type = config.type;
  }
  builder.setBuildPath(path.join(__dirname, 'dist/client'));
  builder.setPublicPath('/public');
  return builder;
}

function getAllPluginByLabel(label, plugins) {
  return plugins.filter(plugin => {
    return plugin.__lable__ === label || plugin.__plugin__ === label;
  });
}

describe('test/html.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#webpack html test', () => {
    it('should config html template', () => {
      const template = path.normalize(path.join(__dirname, 'layout.html'));
      const builder = createBuilder({
        entry:{
          client: './test/client.test.js'
        },
        template
      });
      const webpackConfig = builder.create();
      const htmlPlugins = helper.getPluginByLabel('html-webpack-plugin', webpackConfig.plugins);
      expect(webpackConfig.entry).to.include.keys(['client']);
      expect(htmlPlugins.userOptions.template).to.equal(template);
    });

    it('should entry string and html template test', () => {
      const template = path.normalize(path.join(__dirname, 'layout.html'));
      const builder = createBuilder({
        entry:'./test/client.test.js',
        template
      });
      const webpackConfig = builder.create();
      const htmlPlugins = helper.getPluginByLabel('html-webpack-plugin', webpackConfig.plugins);
      expect(webpackConfig.entry).to.include.keys(['client.test']);
      expect(htmlPlugins.userOptions.template).to.equal(template);
    });

    it('should entry dir html template test', () => {
      const template = path.normalize(path.join(__dirname, 'layout.html'));
      const builder = createBuilder({
        entry:'./test/*.js',
        template
      });
      const webpackConfig = builder.create();
      const htmlPlugins = helper.getPluginByLabel('html-webpack-plugin', webpackConfig.plugins);
      expect(webpackConfig.entry).to.include.keys(['base.test', 'client.test']);
      expect(Object.keys(webpackConfig.entry).length).to.equal(getAllPluginByLabel('html-webpack-plugin',webpackConfig.plugins).length);
      expect(htmlPlugins.userOptions.template).to.equal(template);
    });
  });
});