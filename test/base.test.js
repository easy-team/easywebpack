'use strict';
const expect = require('chai').expect;
const webpack = require('webpack');
const WebpackBaseBuilder = require('../lib/base');

// http://chaijs.com/api/bdd/

describe('base.test.js', () => {
  before(() => {
    this.builder = new WebpackBaseBuilder();
  });

  after(() => {});

  beforeEach(() => {});

  afterEach(() => {});

  describe('#webpack options test', () => {
    it('should setOption', () => {
      const optionPluginCount = this.builder.options.plugins && this.builder.options.plugins.length || 1;

      this.builder.setOption({
        resolve: {
          extensions: ['.vue', '.jsx']
        },
        output: {
          path: __dirname,
          publicPath: __dirname
        },
        plugins: [
          new webpack.DefinePlugin({
            'process.env.VUE_ENV': 'server'
          })
        ]
      });
      expect(this.builder.options.output.path).to.equal(__dirname);
      expect(this.builder.options.output.publicPath).to.equal(__dirname);
      expect(this.builder.options.resolve.extensions).to.have.lengthOf(3);
      expect(this.builder.options.plugins).to.have.lengthOf(optionPluginCount + 1);
    });
  });

  describe('#webpack loader test', () => {
    it('should addLoader', () => {

    });
  });

  describe('#webpack plugin test', () => {
    it('should addPlugin', () => {

    });
  });
});
