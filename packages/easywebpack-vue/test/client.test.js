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
      include: path.join(__dirname)
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
    it('should vue framework test', () => {
      const builder = createBuilder({});
      const webpackConfig = builder.create();
      const rules = webpackConfig.module.rules;
      const vueLoader = getLoaderByName('vue', rules);
      const vuehtml = getLoaderByName('vue-html', rules);
      expect(vueLoader.use[0].loader).to.equal('vue-loader');
      expect(vuehtml.use[0].loader).to.equal('vue-html-loader');
    });

    it('should egg test', () => {
      const builder = createBuilder({ egg: true });
      expect(builder.proxy).to.true;
    });
  });

  describe('#webpack hook test', () => {
    it('should create test', () => {
      const builder = createBuilder({
        create(){
          this.addEntry('configloader', path.join(__dirname, '../config/loader.js'));
        },
        onClient(){
          this.addEntry('configplugin', path.join(__dirname, '../config/plugin.js'));
        }
      });
      const webpackConfig = builder.create();
      expect(webpackConfig.entry).to.include.keys(['client.test', 'configloader', 'configplugin']);
    });
  });

  describe('#webpack client dev test', () => {
    it('should dev hot test', () => {
      const builder = createBuilder({ env: 'dev', log: true });
      const webpackConfig = builder.create();
      expect(webpackConfig.entry['client.test'].length).to.equal(2);
      expect(webpackConfig.entry['server.test'].length).to.equal(2);
    });
    it('should html test', () => {
      const builder = createBuilder({
        entry: {
          template: path.join(__dirname, 'layout.html')
        }
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

  describe('#webpack server plugins test', () => {
    it('should diable vue ssr dynamic plugin config test', () => {
      const builder = createBuilder({});
      const webpackConfig = builder.create();
      const ssrchunk = getPluginByLabel('vuessrchunk',webpackConfig.plugins);
      expect(ssrchunk).to.be.undefined;
    });
  });

  describe('#webpack alias test', () => {
    it('should default vue alias test', () => {
      const builder = createBuilder();
      const webpackConfig = builder.create();
      expect(webpackConfig.resolve.alias).to.have.property('vue');
      expect(webpackConfig.resolve.alias['vue']).to.include('vue/dist/vue.common.js');
    });

    it('should config vue alias test', () => {
      const builder = createBuilder({
        alias:{
          vue: 'vue/dist/vue.esm.js'
        }
      });
      const webpackConfig = builder.create();
      expect(webpackConfig.resolve.alias).to.have.property('vue');
      expect(webpackConfig.resolve.alias['vue']).to.include('vue/dist/vue.esm.js');
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
      expect(tsLoader.use[2].options.toString()).to.equal({ appendTsSuffixTo: [/\.vue$/] }.toString());
    });

    it('should typescript config test', () => {
      const configFile = path.resolve(__dirname, './app/web/tsconfig.json');
      const builder = createBuilder({
        loaders:{
          typescript: {
            options:{
              configFile,
            }
          }
        }
      });
      const webpackConfig = builder.create();
      const tsLoader = getLoaderByName('ts', webpackConfig.module.rules);
      expect(tsLoader.use[2].loader).to.equal('ts-loader');
      expect(tsLoader.use[2].options.toString()).to.equal({ appendTsSuffixTo: [/\.vue$/] }.toString());
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
  describe('#native webpack vue entry set test', () => {
    it('should glob entry test', () => {
      const easywebpack = require('../');
      const webpackConfig = easywebpack.getWebpackConfig({
        target: 'web',
        entry: 'lib/*.js',
      });
      expect(webpackConfig.target).to.equal('web');
      expect(webpackConfig.entry['base']).to.include(path.join(process.cwd(), 'lib/base.js'));
      expect(webpackConfig.entry['client']).to.include(path.join(process.cwd(), 'lib/client.js'));
    });
    it('should object entry test', () => {
      const easywebpack = require('../');
      const webpackConfig = easywebpack.getWebpackConfig({
        target: 'web',
        entry:  {
          base: 'lib/base.js',
          client: 'lib/client.js'
        },
      });
      expect(webpackConfig.entry['base'].length).to.equal(2);
    });
  });
});