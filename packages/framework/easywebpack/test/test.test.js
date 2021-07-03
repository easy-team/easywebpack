'use strict';
const expect = require('chai').expect;
const helper = require('./helper');
const utils = require('../utils/utils');
const WebpackBaseBuilder = require('../lib/target/base');
const WebpackClientBuilder = require('../lib/target/client');
const path = require('path').posix;

// http://chaijs.com/api/bdd/
function createBuilder(config) {
  const builder = new WebpackBaseBuilder(config);
  builder.setBuildPath(path.join(__dirname, '../dist/loader'));
  builder.setPublicPath('/public');
  builder.setEntry({
    include: path.join(__dirname, '../test')
  });
  return builder;
}

function createClientBuilder(config) {
  const builder = new WebpackClientBuilder(config);
  builder.setBuildPath(path.join(__dirname, '../dist/loader'));
  builder.setPublicPath('/public');
  builder.setEntry({
    include: path.join(__dirname, '../test')
  });
  return builder;
}

function getLoadersByName(name, rules) {
  const loaderName = `${name}-loader`;
  return rules.filter(rule => {
    return rule.use.some(loader => {
      return loaderName === loader || (typeof loader === 'object' && loader.loader === loaderName);
    });
  });
}
function getLoaderByTest(test, rules) {
  return rules.find(rule => {
    return rule.test.toString() === test.toString();
  });
}

describe('loader.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });


  describe('#webpack loader options cache test', () => {
    it('should loader options', () => {
      const builder = createBuilder({
        module: {
          rules: [
            { babel:
              {
                include: __dirname,
                exclude: [__dirname]
              }
            },
            { 
              options: { // 扩展配置
                babel: {
                  options: {
                    flag: 1
                  }
                }
              }
            }
          ]
        }
      });
      const webpackConfig = builder.create();
      const babelLoader = helper.getLoaderByName('babel', webpackConfig.module.rules);
      expect(babelLoader.include).to.equal(__dirname);
      expect(babelLoader.exclude[0]).to.equal(__dirname);
      expect(babelLoader.use[1].options.flag).to.equal(1);
    });
  });
});
