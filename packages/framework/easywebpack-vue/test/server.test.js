'use strict';
const expect = require('chai').expect;
const easywebpack = require('easywebpack');
const webpack = easywebpack.webpack;
const merge = easywebpack.merge;
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
          this.addEntry('loader', path.join(__dirname, '../config/loader.js'));
        },
        onServer(){
          this.addEntry('plugin', path.join(__dirname, '../utils/plugin.js'));
        }
      });
      const webpackConfig = builder.create();
      expect(webpackConfig.entry).to.include.keys(['client.test', 'loader', 'plugin']);
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

  describe('#webpack server plugins test', () => {
    it('should vue ssr dynamic plugin config test', () => {
      const builder = createBuilder({});
      const webpackConfig = builder.create();
      const ssrchunk = getPluginByLabel('vuessrchunk',webpackConfig.plugins);
      expect(!!ssrchunk).to.be.true;
    });

    it('should diable vue ssr dynamic plugin config test', () => {
      const builder = createBuilder({ plugins: { vuessrchunk: false }});
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
      expect(webpackConfig.resolve.alias['vue']).to.include('vue/dist/vue.runtime.common.js');
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
});