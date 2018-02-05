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
    it('should vue framework merge test', () => {
      const vueLoaderConfig = {
        vue: {
          test: /\.vue$/,
          exclude: /node_modules/,
          use() {
            return [
              {
                loader: 'vue-loader',
                options: this.createFrameworkLoader('vue-style-loader')
              }
            ];
          }
        },
        vuehtml: {
          test: /\.html$/,
          use: ['vue-html-loader']
        }
      };
      const builder = createBuilder({});
      builder.mergeLoader(vueLoaderConfig);
      const webpackConfig = builder.create();
      const rules = webpackConfig.module.rules;
      const vueLoader = getLoaderByName('vue', rules);
      const vuehtml = getLoaderByName('vue-html', rules);
      expect(vueLoader.use[0].loader).to.equal('vue-loader');
      expect(vueLoader.use[0].options).to.include.all.keys(['preLoaders', 'loaders']);
      expect(vuehtml.use[0].loader).to.equal('vue-html-loader');
    });

    it('should egg test', () => {
      const builder = createBuilder({ egg: true });
      expect(builder.config.proxy).to.true;
    });
  });

  describe('#webpack hook test', () => {
    it('should create test', () => {
      const builder = createBuilder({
        create(){
          this.addEntry('utils', path.join(__dirname, '../utils/utils.js'));
        },
        onClient(){
          this.addEntry('logger', path.join(__dirname, '../utils/logger.js'));
        }
      });
      const webpackConfig = builder.create();
      expect(webpackConfig.entry).to.include.keys(['base.test', 'utils', 'logger']);
    });
  });

  describe('#webpack client dev test', () => {
    it('should dev hot test', () => {
      const builder = createBuilder({ env: 'dev', log: true });
      const webpackConfig = builder.create();
      expect(webpackConfig.entry['base.test'].length).to.equal(2);
      expect(webpackConfig.entry['plugin.test'].length).to.equal(2);
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
    const cdnUrl = 'http://easywebpack.cn/public';
    it('should dev cdn config test', () => {
      const builder = createBuilder({ debug: true, env: 'dev', cdn: { url: cdnUrl} });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal(cdnUrl + '/');
    });
    it('should dev cdn dynamicDir config test', () => {
      const builder = createBuilder({ debug: true, env: 'dev', cdn: { url: cdnUrl, dynamicDir: 'cdn'} });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal(cdnUrl + '/cdn/');
    });
    it('should dev cdn config test', () => {
      const builder = createBuilder({ debug: true, env: 'dev', cdn: { url: cdnUrl} });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal(cdnUrl + '/');
    });

    it('should dev publicPath abspath config test', () => {
      const builder = createBuilder({ debug: true, env: 'dev', publicPath: cdnUrl });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal(cdnUrl + '/');
    });
    
    it('should dev publicPath config test', () => {
      const builder = createBuilder({ debug: true, env: 'dev', publicPath: '/static' });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal(builder.host + '/static/');
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

    it('should dev publicPath env dev proxy config test', () => {
      const host = 'http://debug1.com';
      const builder = createBuilder({ host, env: 'dev' });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal(`${host}:9000/public/`);
    });

    it('should dev publicPath env dev proxy and publicPath config test', () => {
      const host = 'http://debug2.com';
      const builder = createBuilder({ host, env: 'dev' , publicPath: '/static' });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal(`${host}:9000/static/`);
    });

    it('should dev publicPath env dev proxy and http publicPath config test', () => {
      const host = 'http://debug3.com';
      const builder = createBuilder({ host, env: 'dev' , publicPath: 'http://cdn.com/static' });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.publicPath).to.equal(`http://cdn.com/static/`);
    });
  });

  describe('#webpack commonsChunk test', () => {
    it('should dev cdn config test', () => {
      const builder = createBuilder({ env: 'dev', lib: ['mocha'] });
      const webpackConfig = builder.create();
      const commonsChunks = webpackConfig.plugins.filter(plugin =>{
        return plugin.constructor.name === 'CommonsChunkPlugin';
      });
      expect(webpackConfig.entry).to.have.property('common');
      expect(commonsChunks.length).to.equal(2);
    });
  });

  describe('#webpack typescript test', () => {
    it('should default typescript enable test', () => {
      const builder = createBuilder();
      const webpackConfig = builder.create();
      const tsLoader = getLoaderByName('ts', webpackConfig.module.rules);
      const tslint = getLoaderByName('tslint', webpackConfig.module.rules);
      const eslint = getLoaderByName('eslint', webpackConfig.module.rules);
      expect(tsLoader).to.be.undefined;
      expect(tslint).to.be.undefined;
      expect(eslint.use[0].loader).to.equal('eslint-loader');
    });

    it('should typescript enable test', () => {
      const builder = createBuilder({
        loaders:{
          eslint: true,
          tslint: true,
          typescript: true
        }
      });
      const webpackConfig = builder.create();
      const tsLoader = getLoaderByName('ts', webpackConfig.module.rules);
      const eslint = getLoaderByName('eslint', webpackConfig.module.rules);
      const tslint = getLoaderByName('tslint', webpackConfig.module.rules);
      expect(tsLoader.use[0].loader).to.equal('ts-loader');
      expect(eslint.use[0].loader).to.equal('eslint-loader');
      expect(tslint.use[0].loader).to.equal('tslint-loader');
      expect(webpackConfig.resolve.extensions).to.include.members(['.ts', '.js']);
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
      const eslint = getLoaderByName('eslint', webpackConfig.module.rules);
      const tslint = getLoaderByName('tslint', webpackConfig.module.rules);
      expect(eslint).to.be.undefined;
      expect(tslint.use[0].loader).to.equal('tslint-loader');
      expect(tsLoader.use[0].loader).to.equal('ts-loader');
      expect(tsLoader.use[0].options.configFile).to.equal(configFile);
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

    it('should typescript egg configFile auto set test', () => {
      const configFile = path.resolve(process.cwd(), './app/web/tsconfig.json');
      const builder = createBuilder({
        egg: true,
        loaders:{
          typescript: true
        }
      });
      if(!fs.existsSync(configFile)){
        utils.writeFile(configFile, {});
      }
      const webpackConfig = builder.create();
      const tsLoader = getLoaderByName('ts', webpackConfig.module.rules);
      expect(tsLoader.use[0].loader).to.equal('ts-loader');
      expect(tsLoader.use[0].options.configFile).to.equal(configFile);
      fs.unlinkSync(configFile);
    });


    it('should service worker default test', () => {
      const builder = createBuilder({});
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      const serviceworker = getPluginByLabel('serviceworker', plugins);
      expect(!!serviceworker).to.be.false;
    });

    it('should open service worker test', () => {
      const builder = createBuilder({
        plugins: {
          serviceworker: true
        }
      });
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      const serviceworker = getPluginByLabel('serviceworker', plugins);
      expect(!!serviceworker).to.be.true;
    });

    it('should open service worker test', () => {
      const builder = createBuilder({
        env: 'prod',
        plugins: {
          serviceworker: true
        }
      });
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      const serviceworker = getPluginByLabel('serviceworker', plugins);
      expect(serviceworker.options.prefix).to.equal('sw');
      expect(serviceworker.options.hash).to.be.true;
      expect(serviceworker.options.minify).to.be.true;
    });

    it('should override service worker default config test', () => {
      const builder = createBuilder({
        env: 'prod',
        plugins: {
          serviceworker: {
            prefix: '',
            hash: false,
            minify: false
          }
        }
      });
      const webpackConfig = builder.create();
      const plugins = webpackConfig.plugins;
      const serviceworker = getPluginByLabel('serviceworker', plugins);
      expect(serviceworker.options.prefix).to.equal('');
      expect(serviceworker.options.hash).to.be.false;
      expect(serviceworker.options.minify).to.be.false;
    });
  });
});