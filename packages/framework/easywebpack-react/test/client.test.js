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

  describe('#webpack framework test', () => {
    it('should egg test', () => {
      const builder = createBuilder({ egg: true });
      expect(builder.proxy).to.true;
    });
  });

  it('should default react .jsx extensions test', () => {
    const builder = createBuilder();
    const webpackConfig = builder.create();
    expect(webpackConfig.resolve.extensions).to.have.members(['.js','.jsx']);
  });

  describe('#webpack hook test', () => {
    it('should create test', () => {
      const builder = createBuilder({
        create(){
          this.addEntry('config', path.join(__dirname, '../config/config.js'));
        },
        onClient(){
          this.addEntry('configplugin', path.join(__dirname, '../config/plugin.js'));
        }
      });
      const webpackConfig = builder.create();
      expect(webpackConfig.entry).to.include.keys(['client.test', 'config', 'configplugin']);
    });
  });

  describe('#webpack client dev test', () => {
    it('should dev hot test', () => {
      const builder = createBuilder({ env: 'dev', log: true });
      const webpackConfig = builder.create();
      expect(webpackConfig.entry['client.test'].length).to.equal(4);
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
    it('should test cdn dynamicDir config test', () => {
      const builder = createBuilder({ debug: true, env: 'test', cdn: { url: cdnUrl, dynamicDir: 'cdn'} });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal(cdnUrl + '/cdn/public/');
    });
    it('should test cdn config test', () => {
      const builder = createBuilder({ debug: true, env: 'test', cdn: { url: cdnUrl} });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal(cdnUrl + '/public/');
    });

    it('should dev publicPath abspath config test', () => {
      const builder = createBuilder({ debug: true, env: 'dev', publicPath: cdnUrl });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal(cdnUrl + '/');
    });
    
    it('should dev publicPath config test', () => {
      const builder = createBuilder({ debug: true, env: 'dev', publicPath: '/static' });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal('/static/');
    });

    it('should dev publicPath useHost false config test', () => {
      const builder = createBuilder({ debug: true, env: 'dev', publicPath: '/static', useHost: false });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal('/static/');
    });

    it('should dev publicPath default env prod config test', () => {
      const builder = createBuilder({ debug: true, env: 'test' });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal('/public/');
    });

    it('should dev publicPath env test config test', () => {
      const builder = createBuilder({ debug: true, env: 'test', publicPath: '/static' });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal('/static/');
    });
  });

  describe('#webpack typescript test', () => {
    it('should default typescript enable test', () => {
      const builder = createBuilder();
      const webpackConfig = builder.create();
      const tsLoader = getLoaderByName('ts', webpackConfig.module.rules);
      expect(tsLoader).to.be.undefined;
    });

    it('should typescript enable test', () => {
      const builder = createBuilder({
        loaders:{
          typescript: true
        }
      });
      const webpackConfig = builder.create();
      const tsLoader = getLoaderByName('ts', webpackConfig.module.rules);
      expect(tsLoader.use[2].loader).to.equal('ts-loader');
    });

    it('should typescript config test', () => {
      const configFile = path.resolve(__dirname, './app/web/tsconfig.json');
      const builder = createBuilder({
        loaders:{
          typescript: {
            options:{
              configFile
            }
          }
        }
      });
      const webpackConfig = builder.create();
      const tsLoader = getLoaderByName('ts', webpackConfig.module.rules);
      expect(tsLoader.use[0].loader).to.equal('cache-loader');
      expect(tsLoader.use[2].loader).to.equal('ts-loader');
      expect(tsLoader.use[2].options.configFile).to.equal(configFile);
    });

    it('should tslint enable test', () => {
      const builder = createBuilder({
        loaders:{
          tslint: true
        }
      });
      const webpackConfig = builder.create();
      const tsLoader = getLoaderByName('tslint', webpackConfig.module.rules);
      expect(tsLoader.use[0].loader).to.equal('tslint-loader');
    });
  });

  describe('#native webpack test', () => {
    it('should default getWebpackConfig client test', () => {
      const easywebpack = require('../');
      const webpackConfig = easywebpack.getWebpackConfig({ target: 'web' });
      expect(webpackConfig.target).to.equal('web');
    });

    it('should default getWebpackConfig server test', () => {
      const easywebpack = require('../');
      const webpackConfig = easywebpack.getWebpackConfig({ target: 'node' });
      expect(webpackConfig.target).to.equal('node');
    });
  });
});