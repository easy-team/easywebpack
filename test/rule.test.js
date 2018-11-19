'use strict';
const expect = require('chai').expect;
const helper = require('./helper');

describe('rules.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#webpack rule test', () => {
    it('should webpack rules enable test', () => {
      const builder = helper.createBuilder({
        module: {
          rules: [
            {
              eslint: true
            },
            {
              babel: false
            },
            {
              urlfont: false
            },
            {
              urlmedia: false
            },
          ]
        }
      });
      const webpackConfig = builder.create();
      const rules = webpackConfig.module.rules;
      expect(helper.getLoaderByName('eslint', rules).use[0].loader).to.equal('eslint-loader');
      expect(helper.getLoaderByName('babel', rules)).to.be.undefined;
      expect(helper.getLoaderByName(/\.(woff2?|eot|ttf|otf)(\?.*)?$/, rules)).to.be.undefined;
    });
  });
});
