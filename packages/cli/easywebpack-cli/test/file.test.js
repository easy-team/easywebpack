'use strict';
const path = require('path');
const fs = require('fs');
const rimraf = require('mz-modules/rimraf');
const mkdirp = require('mz-modules/mkdirp');
const expect = require('chai').expect;

// require('co-mocha');
// http://chaijs.com/api/bdd/

describe('file.test.js', () => {
  before(() => {
   
  });
  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#file test', () => {
    it('should cli file', () => {
      const cli = require('../bin/cli');
      expect(!!cli).to.be.true;
    });
    it('should builder file', () => {
      const builder = require('../lib/builder');
      expect(!!builder).to.be.true;
    });
    it('should command file', () => {
      const command = require('../lib/command');
      expect(!!command).to.be.true;
    });
    it('should builder file', () => {
      const download = require('../lib/download');
      expect(!!download).to.be.true;
    });
    it('should builder file', () => {
      const install = require('../lib/install');
      expect(!!install).to.be.true;
    });
    it('should upgrade file', () => {
      const upgrade = require('../lib/upgrade');
      expect(!!upgrade).to.be.true;
    });
    it('should utils file', () => {
      const utils = require('../lib/utils');
      expect(!!utils).to.be.true;
    });
  });
});
