'use strict';
const expect = require('chai').expect;
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const merge = WebpackTool.merge;
const helper = require('./helper');
const WebpackServerBuilder = require('../lib/server');
const path = require('path').posix;

// http://chaijs.com/api/bdd/
function createBuilder(config) {
  const builder = new WebpackServerBuilder(merge({
    cost: true,
    publicPath: '/public',
    entry: {
      include: path.join(__dirname)
    }
  }, config));
  if (config && config.type) {
    builder.type = config.type;
  }
  return builder;
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
      const vueLoader = helper.getLoaderByName('vue', rules);
      const vuehtml = helper.getLoaderByName('vue-html', rules);
      expect(vueLoader.use[0].loader).to.equal('vue-loader');
      expect(vueLoader.use[0].options).to.include.all.keys(['preLoaders', 'loaders']);
      expect(vuehtml.use[0].loader).to.equal('vue-html-loader');
    });

    it('should egg test', () => {
      const builder = createBuilder({ egg: true, buildPath: 'dist', baseDir: path.join(__dirname, '..') });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.path).to.equal(path.join(__dirname, '../app/view'));
    });
  });

  describe('#webpack hook test', () => {
    it('should create test', () => {
      const builder = createBuilder({
        create(){
          this.addEntry('utils', path.join(__dirname, '../utils/utils.js'));
        },
        onServer(){
          this.addEntry('logger', path.join(__dirname, '../utils/logger.js'));
        }
      });
      const webpackConfig = builder.create();
      expect(webpackConfig.entry).to.include.keys(['base.test', 'utils', 'logger']);
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

  it('should typescript config test', () => {
    const configFile = path.resolve(__dirname, './app/web/tsconfig.json');
    const builder = createBuilder({
      cache: false,
      loaders:{
        typescript: {
          options:{
            configFile,
          }
        }
      }
    });
    const webpackConfig = builder.create();
    const tsLoader = helper.getLoaderByName('ts', webpackConfig.module.rules);
    const eslint = helper.getLoaderByName('eslint', webpackConfig.module.rules);
    const tslint = helper.getLoaderByName('tslint', webpackConfig.module.rules);
    expect(eslint).to.be.undefined;
    expect(tslint).to.be.undefined;
    expect(tsLoader.use[2].loader).to.equal('ts-loader');
    expect(tsLoader.use[2].options.configFile).to.equal(configFile);
  });

  it('should server service worker disable test', () => {
    const builder = createBuilder({
      plugins: {
        serviceworker: true
      }
    });
    const webpackConfig = builder.create();
    const plugins = webpackConfig.plugins;
    const serviceworker = helper.getPluginByLabel('serviceworker', plugins);
    expect(!!serviceworker).to.be.false;
  });
  it('should node console env dev test', () => {
    const builder = createBuilder({ env: 'dev' });
    const webpackConfig = builder.create();
    expect(webpackConfig.node.console).to.be.true;
  });
  it('should node console env prod test', () => {
    const builder = createBuilder({ env: 'prod' });
    const webpackConfig = builder.create();
    expect(webpackConfig.node.console).to.be.false;
  });
});