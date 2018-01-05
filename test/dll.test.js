'use strict';
const fs = require('fs');
const expect = require('chai').expect;
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const utils = require('../utils/utils');
const WebpackDllBuilder = require('../lib/dll');
const WebpackClientBuilder = require('../lib/client');
const path = require('path').posix;
const baseDir = path.join(__dirname, '..');

class DllBuilder extends WebpackDllBuilder {
  constructor(config) {
    super(config);
    this.mergeConfig({
      buildPath: 'dist/vue',
      publicPath: 'public/dist'
    });
  }
}

function getPluginByLabel(label, plugins) {
  return plugins.find(plugin => {
    return plugin.__lable__ === label || plugin.__plugin__ === label;
  });
}

describe('dll.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#webpack dll test', () => {
    it('should dll plugin config test', () => {
      const builder = new DllBuilder({
        baseDir,
        dll: ['mocha']
      });
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      expect(webpackConfig.entry).to.to.have.property('vendor');
      expect(!!getPluginByLabel('DllPlugin', plugins)).to.be.true;
    });

    it('should dll refrence plugin test', () => {
      const filename = WebpackClientBuilder.getDllFilePath('vendor');
      if (!fs.existsSync(filename)) {
        utils.writeFile(filename, {});
      }
      const builder = new WebpackClientBuilder({  entry: {
        include: __dirname,
        template: 'test/layout.html'
      }, dll: ['mocha'] });
      const webpackConfig = builder.createWebpackConfig();
      const dllReferencePlugin = getPluginByLabel('DllReferencePlugin', webpackConfig.plugins);
      expect(!!dllReferencePlugin).to.be.true;
      fs.unlinkSync(filename);
    });
  });
});
