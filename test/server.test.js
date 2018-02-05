'use strict';
const expect = require('chai').expect;
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const merge = WebpackTool.merge;
const WebpackServerBuilder = require('../lib/server');
const path = require('path').posix;

// http://chaijs.com/api/bdd/
function createBuilder(config) {
  const builder = new WebpackServerBuilder(merge({
    cost: true,
    buildPath: 'dist/client',
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
      const builder = createBuilder({ egg: true, baseDir: path.join(__dirname, '..') });
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

  it('should server service worker disable test', () => {
    const builder = createBuilder({
      plugins: {
        serviceworker: true
      }
    });
    const webpackConfig = builder.create();
    const plugins = webpackConfig.plugins;
    const serviceworker = getPluginByLabel('serviceworker', plugins);
    expect(!!serviceworker).to.be.false;
  });
});