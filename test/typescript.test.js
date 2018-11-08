'use strict';
const expect = require('chai').expect;
const helper = require('./helper');
// http://chaijs.com/api/bdd/

describe('typescript.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#webpack typescript test', () => {

    it('should webpack typescript extendsions test', () => {
      const builder = helper.createClientBuilder({ loaders: { typescript: true }});
      const webpackConfig = builder.create();
      expect(webpackConfig.resolve.extensions).to.include.members(['.ts']);
    });

    it('should webpack typescript babel test', () => {
      const builder = helper.createClientBuilder({ framework: 'react', loaders: { typescript: true }});
      const webpackConfig = builder.create();
      const loaders = helper.getLoaderByName('ts', webpackConfig.module.rules);
      expect(webpackConfig.resolve.extensions).to.include.members(['.ts']);
      expect(loaders.use.length).to.equal(4);
      expect(loaders.use[0].loader).to.equal('babel-loader');
    });
  });
});