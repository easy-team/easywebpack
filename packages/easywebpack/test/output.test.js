'use strict';
const expect = require('chai').expect;
const helper = require('./helper');
const path = require('path');
describe('output.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#webpack output test', () => {
    it('should webpack output.path and output.publicPath test', () => {
      const builder = helper.createBuilder({
        output: {
          path: __dirname,
          publicPath: '/test/'
        }
      });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.path).to.be.equal(__dirname);
      expect(webpackConfig.output.publicPath).to.be.equal('/test/');
    });
    it('should webpack output.path-buildPath and output.publicPath-publicPath  test', () => {
      const builder = helper.createClientBuilder({
        buildPath: 'old',
        publicPath: '/old/',
        output: {
          path: __dirname,
          publicPath: '/test/'
        }
      });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.path).to.be.equal(__dirname);
      expect(webpackConfig.output.publicPath).to.be.equal('/test/');
    });
    it('should webpack output.path-buildPath and output.publicPath-publicPath egg test', () => {
      const builder = helper.createServerBuilder({
        egg: true,
        buildPath: 'old',
        publicPath: '/old/',
        output: {
          path: __dirname,
          publicPath: '/test/'
        }
      });
      const webpackConfig = builder.create();
      expect(webpackConfig.output.path).to.be.equal(path.join(process.cwd(), 'app/view'));
      expect(webpackConfig.output.publicPath).to.be.equal('/test/');
    });
  });
});
