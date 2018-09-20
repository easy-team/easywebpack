'use strict';
const expect = require('chai').expect;
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const merge = WebpackTool.merge;
const WebpackClientBuilder = require('../lib/client');
const path = require('path').posix;
const fs = require('fs');
const utils = require('../utils/utils');
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

function getAllPluginByLabel(label, plugins) {
  return plugins.filter(plugin => {
    return plugin.__lable__ === label || plugin.__plugin__ === label;
  });
}

describe('html.test.js', () => {
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
      const htmlPlugins = getPluginByLabel('html-webpack-plugin', webpackConfig.plugins);
      expect(webpackConfig.entry).to.include.keys(['client']);
      expect(htmlPlugins.options.template).to.equal(template);
    });

    it('should entry string and html template test', () => {
      const template = path.normalize(path.join(__dirname, 'layout.html'));
      const builder = createBuilder({
        entry:'./test/client.test.js',
        template
      });
      const webpackConfig = builder.create();
      const htmlPlugins = getPluginByLabel('html-webpack-plugin', webpackConfig.plugins);
      expect(webpackConfig.entry).to.include.keys(['client.test']);
      expect(htmlPlugins.options.template).to.equal(template);
    });

    it('should entry dir html template test', () => {
      const template = path.normalize(path.join(__dirname, 'layout.html'));
      const builder = createBuilder({
        entry:'./test/*.js',
        template
      });
      const webpackConfig = builder.create();
      const htmlPlugins = getPluginByLabel('html-webpack-plugin', webpackConfig.plugins);
      expect(webpackConfig.entry).to.include.keys(['base.test', 'client.test']);
      expect(Object.keys(webpackConfig.entry).length).to.equal(getAllPluginByLabel('html-webpack-plugin',webpackConfig.plugins).length);
      expect(htmlPlugins.options.template).to.equal(template);
    });
  });
});