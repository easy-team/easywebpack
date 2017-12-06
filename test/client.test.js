'use strict';
const expect = require('chai').expect;
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const merge = WebpackTool.merge;
const WebpackClientBuilder = require('../lib/client');
const path = require('path').posix;

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
    return plugin.__lable__ === label || plugin.__plugin__ === 'html-webpack-plugin';
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
      expect(builder.proxy).to.true;
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
      const html= webpackConfig.plugins.filter(plugin => {
        return plugin.__plugin__ === 'html-webpack-plugin';
      });
      expect(html.length).to.equal(Object.keys(webpackConfig.entry).length);
    });
  });
});