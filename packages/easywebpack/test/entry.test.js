'use strict';
const expect = require('chai').expect;
const utils = require('../utils/utils');
const path = require('path').posix;
const baseDir = path.join(__dirname, '../');
// http://chaijs.com/api/bdd/

const fileNames = ['base.test', 'client.test', 'entry.test', 'loader.test', 'plugin.test', 'server.test'];
describe('entry.test.js', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#webpack entry test', () => {
    it('should entry webpack object test', () => {
      const entry = {
        'base.test': path.join(baseDir, 'test/base.test.js'),
        'client.test': path.join(baseDir, 'test/client.test.js')
      };
      const entries = utils.getEntry({ baseDir, entry });
      expect(Object.keys(entries).length).to.equal(2);
      expect(entries).to.include.all.keys(['base.test', 'client.test']);
      expect(entries['base.test']).to.not.include('babel-loader');
    });

    it('should entry regex test', () => {
      const entry = /test\/*\.js/;
      const entries = utils.getEntry({ baseDir, entry });
      expect(entries).to.include.all.keys(fileNames);
      expect(entries['base.test']).to.not.include('babel-loader');
    });

    it('should entry include dir test', () => {
      const entry = {
        include: 'test'
      };
      const entries = utils.getEntry({ baseDir, entry });
      expect(entries).to.include.all.keys(fileNames);
      expect(entries['base.test']).to.not.include('babel-loader');
    });

    it('should entry include regex test', () => {
      const entry = {
        include: /test\/*\.js/
      };
      const entries = utils.getEntry({ baseDir, entry });
      expect(entries).to.include.all.keys(fileNames);
      expect(entries['base.test']).to.not.include('babel-loader');
    });

    it('should entry include regex and exclude  array str test', () => {
      const entry = {
        include: /test\/*\.js/,
        exclude: ['base.test.js']
      };
      const entries = utils.getEntry({ baseDir, entry });
      expect(entries).to.not.include.keys('base.test');
      expect(entries['base.test']).to.be.undefined;
    });

    it('should entry include regex and exclude str test', () => {
      const entry = {
        include: /test\/*\.js/,
        exclude: 'base.test.js'
      };
      const entries = utils.getEntry({ baseDir, entry });
      expect(entries).to.not.include.keys('base.test');
      expect(entries['base.test']).to.be.undefined;
    });

    it('should entry include regex and exclude regex test', () => {
      const entry = {
        include: /test\/*\.js/,
        exclude: /base\.test\.js/
      };
      const entries = utils.getEntry({ baseDir, entry });
      expect(entries).to.not.include.keys('base.test');
      expect(entries['base.test']).to.be.undefined;
    });

    it('should entry include regex complex, and exclude regex complex test', () => {
      const entry = {
        include: [/test\/*\.js/, 'lib', { hot: path.join(baseDir,'utils/hot.js') }],
        exclude: [/base\.test\.js/, 'builder']
      };
      const entries = utils.getEntry({ baseDir, entry });
      expect(entries).to.include.keys('entry.test', 'target/dll','hot');
      expect(entries['base.test']).to.be.undefined;
      expect(entries.builder).to.be.undefined;
    });

    it('should entry include regex complex, and exclude regex complex test', () => {
      const entry = {
        include: [/test\/*\.js/, 'lib', { hot: path.join(baseDir,'utils/hot.js'), install: 'utils/install.js?loader=false' }],
        exclude: [/base\.test\.js/, 'builder'],
        loader: {
          client: 'utils/logger.js'
        }
      };
      const entries = utils.getEntry({ baseDir, entry }, 'client');
      expect(entries).to.include.keys('entry.test', 'target/dll', 'hot', 'install');
      expect(entries['entry.test']).to.include('babel-loader');
      expect(entries['entry.test']).to.include('utils/logger.js');
      expect(entries.install).to.not.include('babel-loader');
    });
  });
});