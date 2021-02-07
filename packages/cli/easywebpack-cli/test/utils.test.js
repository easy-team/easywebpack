'use strict';
const path = require('path');
const fs = require('fs');
const rimraf = require('mz-modules/rimraf');
const mkdirp = require('mz-modules/mkdirp');
const expect = require('chai').expect;
const utils = require('../lib/utils');
const baseDir = process.cwd();
// require('co-mocha');
// http://chaijs.com/api/bdd/

describe('utils.test.js', () => {
  before(() => {

  });
  after(() => {});

  beforeEach(() => {});

  afterEach(() => {});

  describe('#utils test', () => {
    it('should utils method typeof', () => {
      const f = () => {};
      expect(utils.isFunction(f)).to.be.true;
      expect(utils.isString('')).to.be.true;
      expect(utils.isUdefined(undefined)).to.be.true;
      expect(utils.isObject({})).to.be.true;
      expect(utils.isBoolean(false)).to.be.true;
    });

    it('should utils getCompileTempDir test', () => {
      expect(utils.getCompileTempDir()).to.be.include('easywebpack');
    });

    it('should utils getInstallPackage test', () => {
      expect(utils.getInstallPackage('commander').name).to.be.string;
    });

    it('should utils clearManifest test', function* () {
      const dist = utils.getCompileTempDir();
      const target = path.posix.join(dist, 'config/manifest.json');
      yield mkdirp(path.dirname(target));
      fs.writeFileSync(target, 'clearManifest')
      expect(fs.existsSync(target)).to.be.true;
      utils.clearManifest(dist);
      expect(fs.existsSync(target)).to.be.false;
    });

    it('should utils clearBuildDir test', function* () {
      const dist = utils.getCompileTempDir();
      const target = path.posix.join(dist, 'public');
      yield mkdirp(target);
      expect(fs.existsSync(target)).to.be.true;
      utils.clearBuildDir(dist);
      expect(fs.existsSync(target)).to.be.false;
    });

    it('should utils clearTempDir test', function* () {
      const dist = utils.getCompileTempDir();
      const target = path.posix.join(dist, `${Math.floor(Math.random()*100000)}_test.json`);
      yield mkdirp(path.dirname(dist));
      fs.writeFileSync(target, 'clearTempDir', 'utf8')
      expect(fs.existsSync(target)).to.be.true;
      utils.clearTempDir();
      expect(fs.existsSync(target)).to.be.false;
    });

    it('should utils initOption default test', function* () {
      const program = require('commander');
      const option = utils.initOption(program);
      expect(option.target).to.be.undefined;
      expect(option.target).to.be.undefined;
      expect(option.proxy).to.be.undefined;
    });

    it('should utils initOption set test', function* () {
      const program = require('commander');
      program.web = true;
      const option = utils.initOption(program, undefined, {
        proxy: true
      });
      expect(option.target).to.equal('web');
      expect(option.proxy).to.be.true;
    });

    it('should utils initWebpackConfig default test', function* () {
      const program = require('commander');
      const option = utils.initWebpackConfig(program, {
        baseDir: path.join(baseDir, 'test')
      });
      expect(option.proxy).to.be.undefined;
      expect(option.framework).to.be.undefined;
      expect(option.env).to.be.undefined;
      expect(option.port).to.be.undefined;
    });
    it('should utils initWebpackConfig set test', function* () {
      const program = require('commander');
      program.port = 9000;
      program.type = 'client';
      program.hash = true;
      program.size = true;
      program.compress = true;
      const cfg = utils.initWebpackConfig(program, {
        baseDir: path.join(baseDir, 'test'),
        framework: 'js',
        env: 'test'
      });
      const option = cfg.config;
      expect(option.framework).to.equal('js');
      expect(option.type).to.equal('client');
      expect(option.env).to.equal('test');
      expect(option.port).to.equal(9000);
      expect(option.miniJs).to.be.true;
      expect(option.miniCss).to.be.true;
      expect(option.miniImage).to.be.true;
      expect(option.hash).to.be.true;
    });
  });
});