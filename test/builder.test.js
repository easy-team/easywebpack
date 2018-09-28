'use strict';
const fs = require('fs');
const expect = require('chai').expect;
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const utils = require('../utils/utils');
const easywebpack = require('../index');
const WebpackBuilder = require('../lib/builder');
const path = require('path').posix;
const baseDir = path.join(__dirname, '..');

function getPluginByLabel(label, plugins) {
  return plugins.find(plugin => {
    return plugin.__lable__ === label || plugin.__plugin__ === label;
  });
}

describe('builder.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#webpack builder.getBuilderConfig test', () => {
    it('should test', () => {
      const builderConfig = WebpackBuilder.getBuilderConfig();
      expect(builderConfig.baseDir).to.equal(process.cwd());
    });

    it('should param test', () => {
      const builderConfig = WebpackBuilder.getBuilderConfig({ baseDir: __dirname, type: 'client' });
      expect(builderConfig.baseDir).to.equal(__dirname);
      expect(builderConfig.type).to.equal('client');
    });

    it('should param file test', () => {
      const builderConfig = WebpackBuilder.getBuilderConfig(path.resolve(__dirname, '../config/config.js'));
      expect(builderConfig.baseDir).to.equal(process.cwd());
      expect(builderConfig).to.include.keys(['devConfig','testConfig']);
    });

    it('should param webpack.config.js test', () => {
      const configFile = path.resolve(process.cwd(), 'webpack.config.js');
      if(!fs.existsSync(configFile)){
        utils.writeFile(configFile, "module.exports={ baseDir: '/test'}");
      }
      const builderConfig = WebpackBuilder.getBuilderConfig();
      expect(builderConfig.baseDir).to.equal('/test');
      fs.unlinkSync(configFile);
    });
  });

  describe('#webpack builder.getWebpackConfig test', () => {
    it('should default test', () => {
      const webpackConfig = easywebpack.getWebpackConfig();
      expect(webpackConfig.length).to.equal(2);
    });

    it('should type:client test', () => {
      const webpackConfig = easywebpack.getWebpackConfig( { type: 'client'});
      expect(webpackConfig.target).to.equal('web');
    });

    it('should type:server test', () => {
      const webpackConfig = easywebpack.getWebpackConfig( { type: 'server'});
      expect(webpackConfig.target).to.equal('node');
    });
  });

  describe('#webpack builder.getDllWebpackConfig test', () => {
    it('should default test', () => {
      const webpackConfig = easywebpack.getDllWebpackConfig();
      expect(webpackConfig).to.be.null;
    });
    it('should one dll test', () => {
      const webpackConfig = easywebpack.getDllWebpackConfig({ dll: ['vue', 'vuex']});
      const dllPlugin = getPluginByLabel('DllPlugin', webpackConfig.plugins);
      expect(webpackConfig.target).to.equal('web');
      expect(dllPlugin).to.include.keys(['__lable__']);
    });

    it('should getWebpackConfig onlyDll test', () => {
      const webpackConfig = easywebpack.getWebpackConfig({ dll: ['vue', 'vuex']}, { onlyDll: true });
      const dllPlugin = getPluginByLabel('DllPlugin', webpackConfig.plugins);
      expect(webpackConfig.target).to.equal('web');
      expect(dllPlugin).to.include.keys(['__lable__']);
    });

    it('should getWebpackConfig dll test', () => {
      const webpackConfig = easywebpack.getWebpackConfig({ dll: ['vue', 'vuex']}, { dll: true });
      console.log(webpackConfig.length);
      expect(webpackConfig.length).to.equal(3);
    });
  });
});
