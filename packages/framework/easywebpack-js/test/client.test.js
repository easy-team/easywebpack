'use strict';
const expect = require('chai').expect;
const WebpackTool = require('webpack-tool');
const webpack = WebpackTool.webpack;
const merge = WebpackTool.merge;
const WebpackClientBuilder = require('../lib/client');
const path = require('path');
const fs = require('fs');

describe('client.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#webpack js config test', () => {
    it('should output default test', () => {
      const builder = new WebpackClientBuilder({
        entry: {
          'index': 'lib/client.js'
        }
      });
      const webpackConfig = builder.create();
      expect(webpackConfig.entry).to.have.keys(['index']);
      expect(webpackConfig.output.path).to.equal(path.join(process.cwd(), 'dist'));
      expect(webpackConfig.output.filename).to.equal('[name].js');
      expect(webpackConfig.output.chunkFilename).to.equal('[name].chunk.js');
    });

    it('should env prod test', () => {
      const builder = new WebpackClientBuilder({
        env: 'prod',
        entry: {
          'index': 'lib/client.js'
        }
      });
      const webpackConfig = builder.create();
      expect(webpackConfig.entry).to.have.keys(['index']);
      expect(webpackConfig.mode).to.equal('production');
      expect(JSON.stringify(webpackConfig.optimization)).to.equal('{}');
    });
  });
});