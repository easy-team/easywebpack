'use strict';
const expect = require('chai').expect;
const helper = require('./helper');
// http://chaijs.com/api/bdd/

describe('test/optimize.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#webpack optimize uglifyJs test', () => {

    it('should webpack optimize minimizer env dev test', () => {
      const builder = helper.createClientBuilder({});
      const webpackConfig = builder.create();
      expect(webpackConfig.optimization.minimizer).to.be.undefined;
    });

    it('should webpack optimize minimizer env dev test', () => {
      const builder = helper.createClientBuilder({
        plugins: {
          uglifyJs: {
            uglifyOptions: {
              warnings: false
            }
          }
        }
      });
      const webpackConfig = builder.create();
      expect(webpackConfig.optimization.minimizer).to.be.undefined;
    });

    it('should webpack optimize minimizer env prod test', () => {
      const builder = helper.createClientBuilder({
        env: 'prod',
        plugins: {
          uglifyJs: {
            uglifyOptions: {
              warnings: false
            }
          }
        }
      });
      const webpackConfig = builder.create();
      expect(webpackConfig.optimization.minimizer[0].constructor.name).to.equal('CssMinimizerPlugin');
    });
  });
});