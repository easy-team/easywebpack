'use strict';
const path = require('path')
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

    it('should default typescript enable test', () => {
      const builder = helper.createBuilder();
      const webpackConfig = builder.create();
      const tsLoader = helper.getLoaderByName('ts', webpackConfig.module.rules);
      const tslint = helper.getLoaderByName('tslint', webpackConfig.module.rules);
      expect(tsLoader).to.be.undefined;
      expect(tslint).to.be.undefined;
    });

    it('should typescript cache enable test', () => {
      const builder = helper.createBuilder({
        loaders:{
          eslint: true,
          tslint: true,
          typescript: true
        },
        compile:{
          thread: false
        }
      });
      const webpackConfig = builder.create();
      const tsLoader = helper.getLoaderByName('ts', webpackConfig.module.rules);
      const eslint = helper.getLoaderByName('eslint', webpackConfig.module.rules);
      const tslint = helper.getLoaderByName('tslint', webpackConfig.module.rules);
      expect(tsLoader.use[0].loader).to.equal('cache-loader');
      expect(tsLoader.use[1].loader).to.equal('ts-loader');
      expect(eslint.use[0].loader).to.equal('eslint-loader');
      expect(tslint.use[0].loader).to.equal('tslint-loader');
      expect(webpackConfig.resolve.extensions).to.include.members(['.ts', '.js']);
    });

    it('should typescript cache and thread enable test', () => {
      const builder = helper.createBuilder({
        loaders:{
          eslint: true,
          tslint: true,
          typescript: true
        }
      });
      const webpackConfig = builder.create();
      const tsLoader = helper.getLoaderByName('ts', webpackConfig.module.rules);
      const eslint = helper.getLoaderByName('eslint', webpackConfig.module.rules);
      const tslint = helper.getLoaderByName('tslint', webpackConfig.module.rules);
      expect(tsLoader.use[0].loader).to.equal('cache-loader');
      expect(tsLoader.use[1].loader).to.equal('thread-loader');
      expect(tsLoader.use[2].loader).to.equal('ts-loader');
      expect(eslint.use[0].loader).to.equal('eslint-loader');
      expect(tslint.use[0].loader).to.equal('tslint-loader');
      expect(webpackConfig.resolve.extensions).to.include.members(['.ts', '.js']);
    });

    it('should typescript cache config test', () => {
      const configFile = path.resolve(__dirname, './app/web/tsconfig.json');
      const builder = helper.createBuilder({
        loaders:{
          typescript: {
            options:{
              configFile,
            }
          }
        },
        compile:{
          thread: false
        }
      });
      const webpackConfig = builder.create();
      const tsLoader = helper.getLoaderByName('ts', webpackConfig.module.rules);
      const eslint = helper.getLoaderByName('eslint', webpackConfig.module.rules);
      const tslint = helper.getLoaderByName('tslint', webpackConfig.module.rules);
      expect(eslint).to.be.undefined;
      expect(tslint).to.be.undefined;
      expect(tsLoader.use[0].loader).to.equal('cache-loader');
      expect(tsLoader.use[1].loader).to.equal('ts-loader');
      expect(tsLoader.use[1].options.configFile).to.equal(configFile);
    });

    it('should typescript cache config test', () => {
      const configFile = path.resolve(__dirname, './app/web/tsconfig.json');
      const builder = helper.createBuilder({
        loaders:{
          typescript: {
            options:{
              configFile,
            }
          }
        },
        compile:{
          thread: false
        }
      });
      const webpackConfig = builder.create();
      const tsLoader = helper.getLoaderByName('ts', webpackConfig.module.rules);
      const eslint = helper.getLoaderByName('eslint', webpackConfig.module.rules);
      const tslint = helper.getLoaderByName('tslint', webpackConfig.module.rules);
      expect(eslint).to.be.undefined;
      expect(tslint).to.be.undefined;
      expect(tsLoader.use[0].loader).to.equal('cache-loader');
      expect(tsLoader.use[1].loader).to.equal('ts-loader');
      expect(tsLoader.use[1].options.configFile).to.equal(configFile);
    });

    it('should tslint enable test', () => {
      const builder = helper.createBuilder({
        loaders:{
          tslint: true
        }
      });
      const webpackConfig = builder.create();
      const tsLoader = helper.getLoaderByName('tslint', webpackConfig.module.rules);
      expect(tsLoader.use[0].loader).to.equal('tslint-loader');
    });

    it('should typescript egg configFile auto set test', () => {
      const builder = helper.createBuilder({
        egg: true,
        loaders:{
          typescript: true
        }
      });
      const webpackConfig = builder.create();
      const tsLoader = helper.getLoaderByName('ts', webpackConfig.module.rules);
      expect(tsLoader.use[2].loader).to.equal('ts-loader');
    });

  });
});